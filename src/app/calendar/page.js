"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Calendar as CalendarIcon, AlertCircle, Clock, TrendingUp, ChevronRight } from "lucide-react";
import styles from "../../styles/calendar.module.css";

// Importa Calendar dinamicamente SOLO lato client
const Calendar = dynamic(() => import("react-calendar"), { ssr: false });
import "react-calendar/dist/Calendar.css";

// Funzione per formattare le date in YYYY-MM-DD
function formatDateLocal(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function isPast(dateString) {
  if (!dateString) return false;
  const today = formatDateLocal(new Date());
  return dateString < today;
}

function typeLabel(type) {
  switch (type) {
    case "ordine":
      return "Ordine";
    case "montaggio":
      return "Montaggio";
    case "appuntamento":
      return "Appuntamento";
    case "mezzo_revisione":
      return "Revisione mezzo";
    case "mezzo_assicurazione":
      return "Assicurazione mezzo";
    case "mezzo_tagliando":
      return "Tagliando mezzo";
    default:
      return type;
  }
}

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // Controlla se il componente è montato lato client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/calendar/events", { cache: "no-store" });
        if (!response.ok) throw new Error(`Errore HTTP! status: ${response.status}`);
        const data = await response.json();
        if (!active) return;
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Errore nel recupero degli eventi del calendario:", err);
        if (!active) return;
        setError(err.message);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      active = false;
    };
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const dateString = event.date;
      if (!dateString) return;
      if (!map.has(dateString)) map.set(dateString, []);
      map.get(dateString).push(event);
    });
    return map;
  }, [events]);

  // Statistiche rapide
  const stats = useMemo(() => {
    const today = formatDateLocal(new Date());
    const futureEvents = events.filter(e => e.date >= today);
    const scadenzeScadute = events.filter(e => 
      String(e.type).startsWith("mezzo_") && isPast(e.date)
    );

    return {
      totaleEventi: events.length,
      eventiProssimi: futureEvents.length,
      scadenzeScadute: scadenzeScadute.length,
    };
  }, [events]);

  // Prossimi 7 giorni di eventi
  const upcomingEvents = useMemo(() => {
    const today = formatDateLocal(new Date());
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekString = formatDateLocal(nextWeek);

    return events
      .filter(e => e.date >= today && e.date <= nextWeekString)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [events]);

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const dateString = formatDateLocal(date);
    const dayEvents = eventsByDate.get(dateString);
    if (!dayEvents || dayEvents.length === 0) return null;

    const hasOrder = dayEvents.some((e) => e.type === "ordine");
    const hasMontaggio = dayEvents.some((e) => e.type === "montaggio");
    const hasApp = dayEvents.some((e) => e.type === "appuntamento");
    const hasRev = dayEvents.some((e) => e.type === "mezzo_revisione");
    const hasAss = dayEvents.some((e) => e.type === "mezzo_assicurazione");
    const hasTag = dayEvents.some((e) => e.type === "mezzo_tagliando");

    const classes = [];
    if (hasOrder) classes.push(styles.hasOrder);
    if (hasMontaggio) classes.push(styles.hasMontaggio);
    if (hasApp) classes.push(styles.hasAppuntamento);
    if (hasRev) classes.push(styles.hasMezzoRevisione);
    if (hasAss) classes.push(styles.hasMezzoAssicurazione);
    if (hasTag) classes.push(styles.hasMezzoTagliando);

    if ((hasRev || hasAss || hasTag) && isPast(dateString)) {
      classes.push(styles.hasMezzoExpired);
    }

    return classes.join(" ");
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateString = formatDateLocal(date);
    const dayEvents = eventsByDate.get(dateString);
    if (!dayEvents || dayEvents.length === 0) return null;

    return (
      <div className={styles.eventCount}>
        {dayEvents.length}
      </div>
    );
  };

  const renderSelectedDayEvents = () => {
    const selectedDateString = formatDateLocal(date);
    const dayEvents = eventsByDate.get(selectedDateString);

    if (!dayEvents || dayEvents.length === 0) {
      return (
        <div className={styles.emptyState}>
          <CalendarIcon size={36} className={styles.emptyIcon} />
          <p className={styles.emptyText}>
            Nessun evento programmato
          </p>
          <p className={styles.emptySubtext}>
            {new Date(selectedDateString).toLocaleDateString("it-IT", { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>
      );
    }

    const sorted = [...dayEvents].sort((a, b) => {
      const rank = (e) => {
        if (e.type === "montaggio") return e.isStartDate ? 0 : 1;
        if (e.type === "appuntamento") return 2;
        if (e.type === "ordine") return 3;
        if (String(e.type).startsWith("mezzo_")) return 4;
        return 5;
      };
      return rank(a) - rank(b);
    });

    const euro = (n) =>
      new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
        Number(n || 0)
      );

    return (
      <ul className={styles.eventList}>
        {sorted.map((event, index) => {
          const isMezzo = String(event.type).startsWith("mezzo_");
          const expired = isMezzo && isPast(selectedDateString);

          const mezzoClass =
            event.type === "mezzo_revisione"
              ? styles.mezzoRevisioneType
              : event.type === "mezzo_assicurazione"
              ? styles.mezzoAssicurazioneType
              : event.type === "mezzo_tagliando"
              ? styles.mezzoTagliandoType
              : styles.mezzoType;

          const showCliente =
            (event.type === "ordine" ||
              event.type === "montaggio" ||
              event.type === "appuntamento") &&
            event.cliente;

          return (
            <li
              key={index}
              className={`${styles.eventItem} ${expired ? styles.eventExpired : ""}`}
            >
              <div className={styles.eventLeft}>
                <span
                  className={`${styles.eventType} ${
                    event.type === "ordine"
                      ? styles.orderType
                      : event.type === "montaggio"
                      ? styles.montaggioType
                      : event.type === "appuntamento"
                      ? styles.appuntamentoType
                      : mezzoClass
                  }`}
                >
                  {typeLabel(event.type)}
                </span>

                <span className={styles.eventMeta}>
                  ID: <strong className={styles.mono}>{event.id}</strong>
                </span>

                {event.type === "montaggio" && event.isStartDate && (
                  <span className={styles.startDateMarker}>Inizio</span>
                )}

                {event.type === "appuntamento" && event.time ? (
                  <span className={styles.eventMeta}>
                    Ora: <strong className={styles.mono}>{event.time}</strong>
                  </span>
                ) : null}

                {showCliente ? (
                  <span className={styles.eventMeta}>
                    Cliente: <strong className={styles.mono}>{event.cliente}</strong>
                  </span>
                ) : null}

                {isMezzo && event.label ? (
                  <span className={styles.eventMeta}>
                    Mezzo: <strong className={styles.mono}>{event.label}</strong>
                  </span>
                ) : null}
              </div>

              <div className={styles.eventRight}>
                {!isMezzo ? (
                  event.type === "appuntamento" ? (
                    <span className={styles.eventValue}>—</span>
                  ) : (
                    <span className={styles.eventValue}>{euro(event.value)}</span>
                  )
                ) : (
                  <span className={styles.eventValue}>{expired ? "Scaduto" : "Scadenza"}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Pianificazione & Scadenze</p>
            <h1 className={styles.heading}>
              Calendario Aziendale
            </h1>
            <p className={styles.subheading}>
              Panoramica completa degli eventi aziendali con gestione ordini, montaggi, appuntamenti e scadenze mezzi.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {loading ? (
          <div className={styles.stateBox}>
            <div className={styles.spinner} />
            <p>Caricamento calendario e eventi...</p>
          </div>
        ) : error ? (
          <div className={styles.stateBoxError}>
            <AlertCircle size={20} />
            <p>Errore nel caricamento del calendario: {error}</p>
          </div>
        ) : (
          <>
            {/* Statistiche rapide */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <p className={styles.statLabel}>Totale eventi</p>
                  <h3 className={styles.statValue}>{stats.totaleEventi}</h3>
                  <p className={styles.statMeta}>Nel database</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className={styles.statLabel}>Eventi futuri</p>
                  <h3 className={styles.statValue}>{stats.eventiProssimi}</h3>
                  <p className={styles.statMeta}>Programmati in calendario</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: stats.scadenzeScadute > 0 ? '#fee2e2' : '#eef2ff' }}>
                  <Clock size={16} style={{ color: stats.scadenzeScadute > 0 ? '#991b1b' : '#1e293b' }} />
                </div>
                <div>
                  <p className={styles.statLabel}>Scadenze scadute</p>
                  <h3 className={styles.statValue} style={{ color: stats.scadenzeScadute > 0 ? '#dc2626' : '#0f172a' }}>
                    {stats.scadenzeScadute}
                  </h3>
                  <p className={styles.statMeta}>
                    {stats.scadenzeScadute > 0 ? 'Richiedono attenzione' : 'Tutte in regola'}
                  </p>
                </div>
              </div>
            </div>

            {/* Layout Orizzontale PROPORZIONATO: Eventi prossimi + Calendario + Eventi giorno */}
            <div className={styles.mainGrid}>
              {/* Colonna Sinistra: Prossimi Eventi (7 giorni) */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Prossimi eventi</h2>
                    <p className={styles.panelSubtitle}>
                      Pianificazione dei prossimi 7 giorni
                    </p>
                  </div>
                </div>

                <div className={styles.upcomingEventsPanel}>
                  {upcomingEvents.length === 0 ? (
                    <div className={styles.emptyStateSmall}>
                      <p className={styles.emptyTextSmall}>Nessun evento nei prossimi 7 giorni</p>
                    </div>
                  ) : (
                    <ul className={styles.compactEventList}>
                      {upcomingEvents.map((event, index) => {
                        const euro = (n) =>
                          new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
                            Number(n || 0)
                          );

                        const eventDate = new Date(event.date + "T00:00:00");
                        const isMezzo = String(event.type).startsWith("mezzo_");
                        const expired = isMezzo && isPast(event.date);

                        return (
                          <li key={index} className={styles.compactEventItem} onClick={() => setDate(eventDate)}>
                            <div className={styles.compactEventDate}>
                              <span className={styles.compactDay}>
                                {eventDate.getDate()}
                              </span>
                              <span className={styles.compactMonth}>
                                {eventDate.toLocaleDateString("it-IT", { month: 'short' })}
                              </span>
                            </div>

                            <div className={styles.compactEventContent}>
                              <div className={styles.compactEventTop}>
                                <span
                                  className={`${styles.compactEventType} ${
                                    event.type === "ordine"
                                      ? styles.orderType
                                      : event.type === "montaggio"
                                      ? styles.montaggioType
                                      : event.type === "appuntamento"
                                      ? styles.appuntamentoType
                                      : styles.mezzoType
                                  }`}
                                >
                                  {typeLabel(event.type)}
                                </span>
                                
                                {!isMezzo && event.type !== "appuntamento" && (
                                  <span className={styles.compactEventValue}>
                                    {euro(event.value)}
                                  </span>
                                )}
                              </div>

                              <div className={styles.compactEventMeta}>
                                {event.cliente && <span>Cliente: {event.cliente}</span>}
                                {event.label && <span>Mezzo: {event.label}</span>}
                                {event.time && <span>Ore: {event.time}</span>}
                              </div>
                            </div>

                            <ChevronRight size={14} className={styles.compactEventArrow} />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* Colonna Centrale: Calendario */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Calendario mensile</h2>
                    <p className={styles.panelSubtitle}>
                      Seleziona un giorno per visualizzare gli eventi
                    </p>
                  </div>
                </div>

                <div className={styles.legendContainer}>
                  <div className={styles.legend}>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotOrder} /> Ordini
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotMontaggio} /> Montaggi
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotAppuntamento} /> Appuntamenti
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotRevisione} /> Revisione
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotAssicurazione} /> Assicurazione
                    </span>
                    <span className={styles.legendItem}>
                      <span className={styles.legendDotTagliando} /> Tagliando
                    </span>
                  </div>
                </div>

                <div className={styles.calendarWrap}>
                  {/* Renderizza Calendar SOLO lato client */}
                  {mounted ? (
                    <Calendar
                      onChange={setDate}
                      value={date}
                      locale="it-IT"
                      tileClassName={tileClassName}
                      tileContent={tileContent}
                    />
                  ) : (
                    <div className={styles.calendarLoading}>
                      <div className={styles.spinner} />
                      <p>Caricamento calendario...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonna Destra: Eventi del giorno selezionato */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <h2 className={styles.panelTitle}>Eventi del giorno</h2>
                    <p className={styles.panelSubtitle}>
                      {date.toLocaleDateString("it-IT", { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long'
                      })}
                    </p>
                  </div>
                  <div className={styles.selectedPill}>
                    {date.toLocaleDateString("it-IT", { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                <div className={styles.eventsPanel}>{renderSelectedDayEvents()}</div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

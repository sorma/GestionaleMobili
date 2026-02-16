"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styles from "../../styles/calendar.module.css";

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

    const showOrder = dayEvents.some((e) => e.type === "ordine");
    const showMontaggio = dayEvents.some((e) => e.type === "montaggio");
    const showApp = dayEvents.some((e) => e.type === "appuntamento");
    const showRev = dayEvents.some((e) => e.type === "mezzo_revisione");
    const showAss = dayEvents.some((e) => e.type === "mezzo_assicurazione");
    const showTag = dayEvents.some((e) => e.type === "mezzo_tagliando");

    return (
      <div className={styles.eventIndicators}>
        {showOrder && <span className={styles.orderIndicator} />}
        {showMontaggio && <span className={styles.montaggioIndicator} />}
        {showApp && <span className={styles.appuntamentoIndicator} />}
        {showRev && <span className={styles.revisioneIndicator} />}
        {showAss && <span className={styles.assicurazioneIndicator} />}
        {showTag && <span className={styles.tagliandoIndicator} />}
      </div>
    );
  };

  const renderSelectedDayEvents = () => {
    const selectedDateString = formatDateLocal(date);
    const dayEvents = eventsByDate.get(selectedDateString);

    if (!dayEvents || dayEvents.length === 0) {
      return (
        <p className={styles.emptyText}>
          Nessun evento per il{" "}
          {new Date(selectedDateString).toLocaleDateString("it-IT")}.
        </p>
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

                {/* ✅ Appuntamenti: SOLO ORA + CLIENTE */}
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
            <h1 className={styles.heading}>
              Calendario Ordini, Montaggi, Appuntamenti e Scadenze
            </h1>
            <p className={styles.subheading}>
              Seleziona un giorno per vedere ordini, montaggi, appuntamenti e scadenze dei mezzi.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
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
            <p>Errore nel caricamento del calendario: {error}</p>
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Calendario</h2>

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
                <Calendar
                  onChange={setDate}
                  value={date}
                  locale="it-IT"
                  tileClassName={tileClassName}
                  tileContent={tileContent}
                />
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Eventi del giorno</h2>
                <div className={styles.selectedPill}>{date.toLocaleDateString("it-IT")}</div>
              </div>

              <div className={styles.eventsPanel}>{renderSelectedDayEvents()}</div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// src/app/calendar/page.js
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../../styles/calendar.module.css';

// Funzione per formattare le date in YYYY-MM-DD
function formatDateLocal(date) {
  return date.getFullYear() + '-' +
         String(date.getMonth() + 1).padStart(2, '0') + '-' +
         String(date.getDate()).padStart(2, '0');
}

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/calendar/events');
        if (!response.ok) {
          throw new Error(`Errore HTTP! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error('Errore nel recupero degli eventi del calendario:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach(event => {
      const dateString = event.date;
      if (!map.has(dateString)) {
        map.set(dateString, []);
      }
      map.get(dateString).push(event);
    });
    return map;
  }, [events]);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = formatDateLocal(date);
      const dayEvents = eventsByDate.get(dateString);

      if (dayEvents && dayEvents.length > 0) {
        const hasOrder = dayEvents.some(event => event.type === 'ordine');
        const hasMontaggio = dayEvents.some(event => event.type === 'montaggio');

        let classes = [];
        if (hasOrder) {
          classes.push(styles.hasOrder);
        }
        if (hasMontaggio) {
          classes.push(styles.hasMontaggio);
        }
        return classes.join(' ');
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateString = formatDateLocal(date);
      const dayEvents = eventsByDate.get(dateString);

      if (dayEvents && dayEvents.length > 0) {
        return (
          <div className={styles.eventIndicators}>
            {dayEvents.some(e => e.type === 'ordine') && <span className={styles.orderIndicator}></span>}
            {dayEvents.some(e => e.type === 'montaggio') && <span className={styles.montaggioIndicator}></span>}
          </div>
        );
      }
    }
    return null;
  };

  const renderSelectedDayEvents = () => {
    const selectedDateString = formatDateLocal(date);
    const dayEvents = eventsByDate.get(selectedDateString);

    if (!dayEvents || dayEvents.length === 0) {
      return <p>Nessun evento per il {new Date(selectedDateString).toLocaleDateString('it-IT')}.</p>;
    }

    return (
      <ul className={styles.eventList}>
        {dayEvents.map((event, index) => (
          <li key={index} className={styles.eventItem}>
            <span className={`${styles.eventType} ${event.type === 'ordine' ? styles.orderType : styles.montaggioType}`}>
              {event.type === 'ordine' ? 'Ordine' : 'Montaggio'}
            </span>
            <span>ID: {event.id}</span>
            <span>Importo: {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(event.value)}</span>
            {event.type === 'montaggio' && event.isStartDate && (
              <span className={styles.startDateMarker}>(Inizio)</span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Caricamento calendario e eventi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Errore nel caricamento del calendario: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Calendario Ordini e Montaggi</h1>
        <Link href="/" className={styles.backButton}>
          ← Torna alla Home
        </Link>
      </div>

      <div className={styles.calendarWrapper}>
        <Calendar
          onChange={setDate}
          value={date}
          locale="it-IT"
          tileClassName={tileClassName}
          tileContent={tileContent}
        />
      </div>

      <div className={styles.selectedDayEvents}>
        <h2 className={styles.selectedDayTitle}>Eventi del Giorno Selezionato</h2>
        {renderSelectedDayEvents()}
      </div>
    </div>
  );
}

export default CalendarPage;

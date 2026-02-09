// src/app/api/calendar/events/route.js
import { NextResponse } from 'next/server';
import { openDb, all } from '../../../../lib/db';

// Funzione per formattare date locali in YYYY-MM-DD
function formatDateLocal(date) {
  return date.getFullYear() + '-' +
         String(date.getMonth() + 1).padStart(2, '0') + '-' +
         String(date.getDate()).padStart(2, '0');
}

export async function GET() {
  try {
    const db = await openDb();

    const ordersQuery = `
      SELECT data_ordine AS event_date,
             totale AS event_value,
             'ordine' AS event_type,
             id AS event_id
      FROM ordini
      WHERE data_ordine IS NOT NULL;
    `;
    const orders = await all(db, ordersQuery);

    const montaggiQuery = `
      SELECT
        data_inizio_stimata AS start_date,
        giorni_lavorativi_stimati AS duration_days,
        importo AS event_value,
        'montaggio' AS event_type,
        id AS event_id
      FROM montaggi
      WHERE data_inizio_stimata IS NOT NULL
        AND giorni_lavorativi_stimati IS NOT NULL;
    `;
    const montaggi = await all(db, montaggiQuery);

    await db.close();

    const montaggiEvents = [];
    montaggi.forEach(montaggio => {
      const startDateParts = montaggio.start_date.split('-');
      const startDate = new Date(
        parseInt(startDateParts[0]),
        parseInt(startDateParts[1]) - 1,
        parseInt(startDateParts[2]),
        12
      );

      const duration = Math.max(1, parseInt(montaggio.duration_days, 10) || 1); 

      for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        montaggiEvents.push({
          event_date: formatDateLocal(currentDate),
          event_value: montaggio.event_value / duration,
          event_type: montaggio.event_type,
          event_id: montaggio.event_id,
          is_start_date: i === 0 
        });
      }
    });

    const allEvents = [
      ...orders.map(o => {
        const orderDateParts = o.event_date.split('-');
        const orderDate = new Date(
          parseInt(orderDateParts[0]),
          parseInt(orderDateParts[1]) - 1,
          parseInt(orderDateParts[2]),
          12
        );
        return {
          date: formatDateLocal(orderDate),
          type: o.event_type,
          id: o.event_id,
          value: o.event_value
        };
      }),
      ...montaggiEvents.map(m => ({
        date: m.event_date,
        type: m.event_type,
        id: m.event_id,
        value: m.event_value,
        isStartDate: m.is_start_date
      }))
    ];

    return NextResponse.json(allEvents);

  } catch (error) {
    console.error('Errore nel recupero degli eventi del calendario:', error);
    return NextResponse.json({ error: 'Errore interno del server nel recupero degli eventi del calendario.' }, { status: 500 });
  }
}

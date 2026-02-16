import { NextResponse } from "next/server";
import { openDb, all } from "../../../../lib/db";

// Funzione per formattare date locali in YYYY-MM-DD
function formatDateLocal(date) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function toLocalDatePartsFromISO(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    date: formatDateLocal(d),
    time: new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(d),
  };
}

export async function GET() {
  let db;
  try {
    db = await openDb();

    // ORDINI + cliente
    const ordersQuery = `
      SELECT
        o.data_ordine AS event_date,
        o.costo AS event_value,
        'ordine' AS event_type,
        o.id AS event_id,
        (c.nome || ' ' || c.cognome) AS cliente
      FROM ordini o
      LEFT JOIN clienti c ON c.id = o.cliente_id
      WHERE o.data_ordine IS NOT NULL;
    `;
    const orders = await all(db, ordersQuery);

    // MONTAGGI + cliente
    const montaggiQuery = `
      SELECT
        m.data_inizio_stimata AS start_date,
        m.giorni_lavorativi_stimati AS duration_days,
        m.importo AS event_value,
        'montaggio' AS event_type,
        m.id AS event_id,
        (c.nome || ' ' || c.cognome) AS cliente
      FROM montaggi m
      LEFT JOIN clienti c ON c.id = m.cliente_id
      WHERE m.data_inizio_stimata IS NOT NULL
        AND m.giorni_lavorativi_stimati IS NOT NULL;
    `;
    const montaggi = await all(db, montaggiQuery);

    // APPUNTAMENTI + cliente (NO telefono)
    const appuntamentiQuery = `
      SELECT
        a.id AS event_id,
        a.data_ora AS iso_datetime,
        'appuntamento' AS event_type,
        (c.nome || ' ' || c.cognome) AS cliente
      FROM appuntamenti a
      LEFT JOIN clienti c ON c.id = a.client_id
      WHERE a.data_ora IS NOT NULL;
    `;
    const appuntamenti = await all(db, appuntamentiQuery);

    // MEZZI (scadenze)
    const mezziQuery = `
      SELECT
        id AS mezzo_id,
        marca,
        modello,
        scadenza_revisione,
        scadenza_assicurazione,
        scadenza_tagliando
      FROM mezzi;
    `;
    const mezzi = await all(db, mezziQuery);

    // Espansione montaggi su più giorni
    const montaggiEvents = [];
    montaggi.forEach((montaggio) => {
      const startDateParts = String(montaggio.start_date).split("-");
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
          event_value: (Number(montaggio.event_value) || 0) / duration,
          event_type: montaggio.event_type,
          event_id: montaggio.event_id,
          is_start_date: i === 0,
          cliente: montaggio.cliente || null,
        });
      }
    });

    // Espansione appuntamenti (ISO -> date/time)
    const appuntamentiEvents = [];
    appuntamenti.forEach((a) => {
      const parts = toLocalDatePartsFromISO(a.iso_datetime);
      if (!parts) return;

      appuntamentiEvents.push({
        date: parts.date,
        type: a.event_type,
        id: a.event_id,
        value: 0,
        cliente: a.cliente || null,
        time: parts.time,
      });
    });

    // Espansione scadenze mezzi
    const mezziEvents = [];
    mezzi.forEach((m) => {
      const label = `${m.marca} ${m.modello}`.trim();

      if (m.scadenza_revisione) {
        mezziEvents.push({
          date: m.scadenza_revisione,
          type: "mezzo_revisione",
          id: m.mezzo_id,
          label,
        });
      }
      if (m.scadenza_assicurazione) {
        mezziEvents.push({
          date: m.scadenza_assicurazione,
          type: "mezzo_assicurazione",
          id: m.mezzo_id,
          label,
        });
      }
      if (m.scadenza_tagliando) {
        mezziEvents.push({
          date: m.scadenza_tagliando,
          type: "mezzo_tagliando",
          id: m.mezzo_id,
          label,
        });
      }
    });

    const allEvents = [
      ...orders.map((o) => {
        const parts = String(o.event_date).split("-");
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12);

        return {
          date: formatDateLocal(d),
          type: o.event_type,
          id: o.event_id,
          value: o.event_value,
          cliente: o.cliente || null,
        };
      }),

      ...montaggiEvents.map((m) => ({
        date: m.event_date,
        type: m.event_type,
        id: m.event_id,
        value: m.event_value,
        isStartDate: m.is_start_date,
        cliente: m.cliente || null,
      })),

      ...appuntamentiEvents,

      ...mezziEvents,
    ];

    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Errore nel recupero degli eventi del calendario:", error);
    return NextResponse.json(
      { error: "Errore interno del server nel recupero degli eventi del calendario." },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

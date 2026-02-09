// src/app/api/montaggi/reports/route.js
import { NextResponse } from 'next/server';
import { openDb, all } from '../../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get('type');

  let query;
  let reportData = [];
  const db = await openDb();

  try {
    switch (reportType) {
      case 'montaggi_by_seller':
        query = `
          SELECT
            v.id AS seller_id,
            v.nome AS seller_name,
            v.cognome AS seller_lastname,
            COUNT(m.id) AS total_montaggi,
            SUM(m.importo) AS total_value
          FROM montaggi AS m
          JOIN venditori AS v ON m.venditore_id = v.id
          GROUP BY v.id, v.nome, v.cognome
          ORDER BY total_value DESC;
        `;
        reportData = await all(db, query);
        break;

      case 'montaggi_by_client':
        query = `
          SELECT
            c.id AS client_id,
            c.nome AS client_name,
            c.cognome AS client_lastname,
            COUNT(m.id) AS total_montaggi,
            SUM(m.importo) AS total_value
          FROM montaggi AS m
          JOIN clienti AS c ON m.cliente_id = c.id -- MODIFICA QUI: da 'clients' a 'clienti'
          GROUP BY c.id, c.nome, c.cognome
          ORDER BY total_value DESC;
        `;
        reportData = await all(db, query);
        break;

      case 'montaggi_over_time_monthly':
        query = `
          SELECT
            STRFTIME('%Y-%m', data_inizio_stimata) AS month_year,
            COUNT(id) AS total_montaggi,
            SUM(importo) AS total_value
          FROM montaggi
          WHERE data_inizio_stimata IS NOT NULL
          GROUP BY month_year
          ORDER BY month_year ASC;
        `;
        const rawData = await all(db, query);
        reportData = rawData.map(item => {
            const [year, monthNum] = item.month_year.split('-');
            const date = new Date(year, monthNum - 1); // Month is 0-indexed
            const monthName = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
            return {
                month: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitalize first letter
                total_montaggi: item.total_montaggi,
                total_value: item.total_value
            };
        });
        break;

      default:
        return NextResponse.json({ error: 'Tipo di report montaggi non valido.' }, { status: 400 });
    }

    await db.close();
    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Errore nel recupero del report dei montaggi:', error);
    await db.close();
    return NextResponse.json({ error: 'Errore interno del server nel recupero del report dei montaggi.' }, { status: 500 });
  }
}

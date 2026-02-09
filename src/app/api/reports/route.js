// src/app/api/reports/route.js
import { NextResponse } from 'next/server';
import { openDb, all } from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  let db;

  try {
    db = await openDb();
    let data = [];

    switch (type) {
      case 'orders_by_seller':
        data = await all(
          db,
          `SELECT
            s.id AS seller_id,
            s.nome AS seller_name,
            s.cognome AS seller_lastname,
            COUNT(o.id) AS total_orders,
            SUM(o.totale) AS total_value
           FROM ordini o
           JOIN venditori s ON o.venditore_id = s.id
           GROUP BY s.id, s.nome, s.cognome
           ORDER BY total_value DESC`
        );
        break;
      case 'orders_by_client':
        data = await all(
          db,
          `SELECT
            c.id AS client_id,
            c.nome AS client_name,
            c.cognome AS client_lastname,
            COUNT(o.id) AS total_orders,
            SUM(o.totale) AS total_value
           FROM ordini o
           JOIN clienti c ON o.cliente_id = c.id
           GROUP BY c.id, c.nome, c.cognome
           ORDER BY total_value DESC`
        );
        break;
      case 'sales_over_time_monthly':
        data = await all(
          db,
          `SELECT
            STRFTIME('%Y-%m', data_ordine) AS month,
            COUNT(id) AS total_orders,
            SUM(totale) AS total_value
           FROM ordini
           GROUP BY month
           ORDER BY month ASC`
        );
        break;
      default:
        return NextResponse.json({ error: 'Tipo di report non valido.' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Errore durante il recupero del report di tipo ${type}:`, error);
    return NextResponse.json({ error: 'Impossibile recuperare i dati del report.' }, { status: 500 });
  } finally {
    if (db) {
      await db.close();
    }
  }
}
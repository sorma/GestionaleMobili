// src/app/api/reports/route.js
import { NextResponse } from "next/server";
import { openDb, all } from "../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  let db;

  try {
    db = await openDb();
    let data = [];

    switch (type) {
      // ==================== REPORT AGGREGATI (TOTALI) ====================

      case "orders_by_seller":
        data = await all(
          db,
          `SELECT
             s.id AS seller_id,
             s.nome AS seller_name,
             s.cognome AS seller_lastname,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(COALESCE(o.costo, 0)), 0) AS total_cost,
             COALESCE(SUM(COALESCE(o.preventivo, 0)), 0) AS total_quote,
             COALESCE(SUM(COALESCE(o.preventivo, 0) - COALESCE(o.costo, 0)), 0) AS total_profit
           FROM ordini o
           JOIN venditori s ON o.venditore_id = s.id
           GROUP BY s.id, s.nome, s.cognome
           ORDER BY total_profit DESC`
        );
        break;

      case "orders_by_client":
        data = await all(
          db,
          `SELECT
             c.id AS client_id,
             c.nome AS client_name,
             c.cognome AS client_lastname,
             COUNT(o.id) AS total_orders,
             COALESCE(SUM(COALESCE(o.costo, 0)), 0) AS total_cost,
             COALESCE(SUM(COALESCE(o.preventivo, 0)), 0) AS total_quote,
             COALESCE(SUM(COALESCE(o.preventivo, 0) - COALESCE(o.costo, 0)), 0) AS total_profit
           FROM ordini o
           JOIN clienti c ON o.cliente_id = c.id
           GROUP BY c.id, c.nome, c.cognome
           ORDER BY total_profit DESC`
        );
        break;

      case "sales_over_time_monthly":
        data = await all(
          db,
          `SELECT
             STRFTIME('%Y-%m', data_ordine) AS month,
             COUNT(id) AS total_orders,
             COALESCE(SUM(COALESCE(costo, 0)), 0) AS total_cost,
             COALESCE(SUM(COALESCE(preventivo, 0)), 0) AS total_quote,
             COALESCE(SUM(COALESCE(preventivo, 0) - COALESCE(costo, 0)), 0) AS total_profit
           FROM ordini
           GROUP BY month
           ORDER BY month ASC`
        );
        break;

      // ==================== REPORT DETTAGLIO (ORDINI SINGOLI) ====================

      case "orders_detail_by_seller": {
        const sellerId = Number(searchParams.get("seller_id"));
        if (!sellerId) {
          return NextResponse.json(
            { error: "seller_id mancante o non valido." },
            { status: 400 }
          );
        }

        data = await all(
          db,
          `SELECT
             o.id AS order_id,
             o.venditore_id AS seller_id,
             o.cliente_id AS client_id,
             o.data_ordine,
             COALESCE(o.costo, 0) AS costo,
             COALESCE(o.preventivo, 0) AS preventivo,
             (COALESCE(o.preventivo, 0) - COALESCE(o.costo, 0)) AS guadagno,
             o.destinazione,
             o.numero_colli,
             o.stato
           FROM ordini o
           WHERE o.venditore_id = ?
           ORDER BY o.data_ordine DESC, o.id DESC`,
          [sellerId]
        );
        break;
      }

      case "orders_detail_by_client": {
        const clientId = Number(searchParams.get("client_id"));
        if (!clientId) {
          return NextResponse.json(
            { error: "client_id mancante o non valido." },
            { status: 400 }
          );
        }

        data = await all(
          db,
          `SELECT
             o.id AS order_id,
             o.venditore_id AS seller_id,
             o.cliente_id AS client_id,
             o.data_ordine,
             COALESCE(o.costo, 0) AS costo,
             COALESCE(o.preventivo, 0) AS preventivo,
             (COALESCE(o.preventivo, 0) - COALESCE(o.costo, 0)) AS guadagno,
             o.destinazione,
             o.numero_colli,
             o.stato
           FROM ordini o
           WHERE o.cliente_id = ?
           ORDER BY o.data_ordine DESC, o.id DESC`,
          [clientId]
        );
        break;
      }

      case "orders_detail_by_month": {
        const month = searchParams.get("month");
        if (!month) {
          return NextResponse.json(
            { error: "month mancante o non valido." },
            { status: 400 }
          );
        }

        data = await all(
          db,
          `SELECT
             o.id AS order_id,
             o.venditore_id AS seller_id,
             o.cliente_id AS client_id,
             o.data_ordine,
             COALESCE(o.costo, 0) AS costo,
             COALESCE(o.preventivo, 0) AS preventivo,
             (COALESCE(o.preventivo, 0) - COALESCE(o.costo, 0)) AS guadagno,
             o.destinazione,
             o.numero_colli,
             o.stato
           FROM ordini o
           WHERE STRFTIME('%Y-%m', o.data_ordine) = ?
           ORDER BY o.data_ordine DESC, o.id DESC`,
          [month]
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: "Tipo di report non valido." },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Errore durante il recupero del report di tipo ${type}:`, error);
    return NextResponse.json(
      { error: "Impossibile recuperare i dati del report." },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

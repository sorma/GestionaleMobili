import { NextResponse } from "next/server";
import { openDb, all } from "../../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  let db;

  try {
    db = await openDb();
    let data = [];

    switch (type) {
      // ==================== REPORT AGGREGATI (TOTALI) ====================

      case "montaggi_by_seller":
        data = await all(
          db,
          `SELECT
             v.id AS seller_id,
             v.nome AS seller_name,
             v.cognome AS seller_lastname,
             COUNT(m.id) AS total_montaggi,
             COALESCE(SUM(COALESCE(m.importo, 0)), 0) AS total_profit
           FROM montaggi m
           JOIN venditori v ON CAST(m.venditore_id AS INTEGER) = v.id
           GROUP BY v.id, v.nome, v.cognome
           ORDER BY total_profit DESC;`
        );
        break;

      case "montaggi_by_client":
        data = await all(
          db,
          `SELECT
             c.id AS client_id,
             c.nome AS client_name,
             c.cognome AS client_lastname,
             COUNT(m.id) AS total_montaggi,
             COALESCE(SUM(COALESCE(m.importo, 0)), 0) AS total_profit
           FROM montaggi m
           JOIN clienti c ON CAST(m.cliente_id AS INTEGER) = c.id
           GROUP BY c.id, c.nome, c.cognome
           ORDER BY total_profit DESC;`
        );
        break;

      case "montaggi_over_time_monthly":
        data = await all(
          db,
          `SELECT
             STRFTIME('%Y-%m', m.data_inizio_stimata) AS month,
             COUNT(m.id) AS total_montaggi,
             COALESCE(SUM(COALESCE(m.importo, 0)), 0) AS total_profit
           FROM montaggi m
           WHERE m.data_inizio_stimata IS NOT NULL
           GROUP BY month
           ORDER BY month ASC;`
        );
        break;

      // ==================== REPORT DETTAGLIO (MONTAGGI SINGOLI) ====================

      case "montaggi_detail_by_seller": {
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
             m.id AS montaggio_id,
             CAST(m.venditore_id AS INTEGER) AS seller_id,
             CAST(m.cliente_id AS INTEGER) AS client_id,
             m.data_inizio_stimata,
             m.indirizzo,
             m.tipologia,
             m.giorni_lavorativi_stimati,
             COALESCE(m.importo, 0) AS profit
           FROM montaggi m
           WHERE CAST(m.venditore_id AS INTEGER) = ?
           ORDER BY m.data_inizio_stimata DESC, m.id DESC;`,
          [sellerId]
        );
        break;
      }

      case "montaggi_detail_by_client": {
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
             m.id AS montaggio_id,
             CAST(m.venditore_id AS INTEGER) AS seller_id,
             CAST(m.cliente_id AS INTEGER) AS client_id,
             m.data_inizio_stimata,
             m.indirizzo,
             m.tipologia,
             m.giorni_lavorativi_stimati,
             COALESCE(m.importo, 0) AS profit
           FROM montaggi m
           WHERE CAST(m.cliente_id AS INTEGER) = ?
           ORDER BY m.data_inizio_stimata DESC, m.id DESC;`,
          [clientId]
        );
        break;
      }

      case "montaggi_detail_by_month": {
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
             m.id AS montaggio_id,
             CAST(m.venditore_id AS INTEGER) AS seller_id,
             CAST(m.cliente_id AS INTEGER) AS client_id,
             m.data_inizio_stimata,
             m.indirizzo,
             m.tipologia,
             m.giorni_lavorativi_stimati,
             COALESCE(m.importo, 0) AS profit
           FROM montaggi m
           WHERE STRFTIME('%Y-%m', m.data_inizio_stimata) = ?
           ORDER BY m.data_inizio_stimata DESC, m.id DESC;`,
          [month]
        );
        break;
      }

      default:
        return NextResponse.json(
          { error: "Tipo di report montaggi non valido." },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Errore nel recupero report montaggi (${type}):`, error);
    return NextResponse.json(
      { error: "Errore interno del server nel recupero del report dei montaggi." },
      { status: 500 }
    );
  } finally {
    if (db) await db.close();
  }
}

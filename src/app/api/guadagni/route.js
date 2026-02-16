import { NextResponse } from "next/server";
import { openDb, get } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET(request) {
  let db;
  try {
    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");   // "2026" oppure "tutti"
    const month = searchParams.get("month"); // "01".."12" oppure "tutti"

    let prefix = null; // "YYYY" o "YYYY-MM"
    if (year && year !== "tutti" && month && month !== "tutti") {
      prefix = `${year}-${month}`;
    } else if (year && year !== "tutti") {
      prefix = `${year}`;
    }

    const likeValue = prefix ? `${prefix}%` : null;

    db = await openDb();

    // 1) Costi tabella costi
    const costiExtraRow = await get(
      db,
      `SELECT COALESCE(SUM(prezzo), 0) AS costi_extra
       FROM costi
       ${prefix ? "WHERE data LIKE ?" : ""}`,
      prefix ? [likeValue] : []
    );

    // 2) Costi tabella ordini (campo costo) filtrati per data_ordine
    const costiOrdiniRow = await get(
      db,
      `SELECT COALESCE(SUM(costo), 0) AS costi_ordini
       FROM ordini
       ${prefix ? "WHERE data_ordine LIKE ?" : ""}`,
      prefix ? [likeValue] : []
    );

    // 3) Ricavi ordini: preventivo (filtrati per data_ordine)
    const ricaviOrdiniRow = await get(
      db,
      `SELECT COALESCE(SUM(preventivo), 0) AS ricavi_ordini
       FROM ordini
       ${prefix ? "WHERE data_ordine LIKE ?" : ""}`,
      prefix ? [likeValue] : []
    );

    // 4) Ricavi montaggi: importo (filtrati per data_inizio_stimata)
    const ricaviMontaggiRow = await get(
      db,
      `SELECT COALESCE(SUM(importo), 0) AS ricavi_montaggi
       FROM montaggi
       ${prefix ? "WHERE data_inizio_stimata LIKE ?" : ""}`,
      prefix ? [likeValue] : []
    );

    const costiExtra = Number(costiExtraRow?.costi_extra ?? 0);
    const costiOrdini = Number(costiOrdiniRow?.costi_ordini ?? 0);
    const ricaviOrdini = Number(ricaviOrdiniRow?.ricavi_ordini ?? 0);
    const ricaviMontaggi = Number(ricaviMontaggiRow?.ricavi_montaggi ?? 0);

    const costiTotali = costiExtra + costiOrdini;
    const ricaviTotali = ricaviOrdini + ricaviMontaggi;
    const differenza = ricaviTotali - costiTotali;

    return NextResponse.json({
      filter: { year: year || "tutti", month: month || "tutti" },

      costiExtra,
      costiOrdini,
      costiTotali,

      ricaviOrdini,
      ricaviMontaggi,
      ricaviTotali,

      differenza,
    });
  } catch (error) {
    console.error("Errore GET /api/guadagni:", error);
    return NextResponse.json({ error: "Impossibile calcolare i guadagni." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}

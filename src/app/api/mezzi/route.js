// src/app/api/mezzi/route.js
import { NextResponse } from "next/server";
import { openDb, exec, all } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  let db;
  try {
    db = await openDb();
    const mezzi = await all(
      db,
      `
      SELECT
        id,
        marca,
        modello,
        anno,
        scadenza_revisione,
        scadenza_assicurazione,
        scadenza_tagliando
      FROM mezzi
      ORDER BY id DESC
      `
    );
    return NextResponse.json(mezzi);
  } catch (error) {
    console.error("Errore durante il recupero dei mezzi:", error);
    return NextResponse.json({ error: "Impossibile recuperare i mezzi." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}

export async function POST(request) {
  let db;
  try {
    const {
      marca,
      modello,
      anno,
      scadenza_revisione,
      scadenza_assicurazione,
      scadenza_tagliando,
    } = await request.json();

    if (!marca || !modello) {
      return NextResponse.json(
        { error: "Marca e modello sono obbligatori." },
        { status: 400 }
      );
    }

    const annoNum =
      anno === "" || anno === null || anno === undefined ? null : Number(anno);

    if (annoNum !== null && (Number.isNaN(annoNum) || annoNum < 1900)) {
      return NextResponse.json({ error: "Anno non valido." }, { status: 400 });
    }

    db = await openDb();

    const result = await exec(
      db,
      `INSERT INTO mezzi
       (marca, modello, anno, scadenza_revisione, scadenza_assicurazione, scadenza_tagliando)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        marca.trim(),
        modello.trim(),
        annoNum,
        scadenza_revisione || null,
        scadenza_assicurazione || null,
        scadenza_tagliando || null,
      ]
    );

    return NextResponse.json(
      {
        id: result.lastID,
        marca: marca.trim(),
        modello: modello.trim(),
        anno: annoNum,
        scadenza_revisione: scadenza_revisione || null,
        scadenza_assicurazione: scadenza_assicurazione || null,
        scadenza_tagliando: scadenza_tagliando || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore durante la creazione del mezzo:", error);
    return NextResponse.json({ error: "Impossibile creare il mezzo." }, { status: 500 });
  } finally {
    if (db) await db.close();
  }
}

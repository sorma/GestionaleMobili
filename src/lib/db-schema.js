import { openDb } from "./db";

async function setupDatabase() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS venditori (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cognome TEXT NOT NULL
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS ordini (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venditore_id INTEGER NOT NULL,
      data_ordine TEXT NOT NULL,
      costo REAL NOT NULL,
      FOREIGN KEY (venditore_id) REFERENCES venditori(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS magazzino (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      macro_categoria TEXT NOT NULL,
      tipo_pezzo TEXT NOT NULL,
      quantita INTEGER NOT NULL DEFAULT 0,
      unita TEXT NOT NULL DEFAULT 'pz',
      riferimento_lavoro TEXT,
      data_inserimento TEXT NOT NULL DEFAULT (datetime('now')),
      CHECK (macro_categoria IN ('armadio','cucina')),
      CHECK (quantita >= 0)
    )
  `);

  console.log('Tabelle create/verificate: venditori, ordini, magazzino.');

  await db.close();
}

export { setupDatabase };

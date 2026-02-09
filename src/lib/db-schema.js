import { openDb } from './db';

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
      totale REAL NOT NULL,
      FOREIGN KEY (venditore_id) REFERENCES venditori(id)
    )
  `);

  console.log('Tabella "ordini" creata (o verificata).');


  await db.close();
  console.log('Tabelle "venditori" e "ordini" create (se non esistevano).');
}

export { setupDatabase };
console.log('Caricamento di lib/db.js'); // Aggiungi questa riga
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

// ... (il resto del tuo codice lib/db.js) ...

const DATABASE_PATH = path.resolve('./data.db');

async function openDb() {
  try {
    sqlite3.verbose(); // Attiva la modalità verbose
    const db = await new Promise((resolve, reject) => {
      const newDb = new Database(DATABASE_PATH, (err) => {
        if (err) {
          console.error('Errore nell\'apertura del database:', err);
          reject(err);
        } else {
          resolve(newDb);
        }
      });
    });
    return db;
  } catch (error) {
    console.error('Errore nell\'apertura del database:', error);
    throw error;
  } finally {
    // sqlite3.verbose(); // Puoi disattivarla qui se vuoi
  }
}

// Funzione per eseguire query (promisificata)
async function exec(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error('Errore nell\'esecuzione della query:', err);
        reject(err);
      } else {
        resolve(this); // 'this' context contiene informazioni sull'ultima operazione
      }
    });
  });
}

// Funzione per ottenere una riga (promisificata)
async function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Errore nella query get:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Funzione per ottenere tutte le righe (promisificata)
async function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Errore nella query all:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export { openDb, exec, get, all };
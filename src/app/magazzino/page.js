"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import styles from "../../styles/client-seller-magazine-report-list.module.css";

export default function MagazzinoPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [qty, setQty] = useState("1");
  const [modalError, setModalError] = useState("");
  const [busy, setBusy] = useState(false);

  // "scarico" | "carico"
  const [modalMode, setModalMode] = useState("scarico");

  const disponibili = useMemo(() => Number(selectedRow?.quantita) || 0, [selectedRow]);

  const load = async () => {
    setError("");
    const res = await fetch("/api/magazzino", { cache: "no-store" });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setRows([]);
      setError(data?.error || "Errore nel caricamento del magazzino.");
      return;
    }

    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (r, mode) => {
    setSelectedRow(r);
    setModalMode(mode); // "scarico" oppure "carico"
    setQty("1");
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setModalOpen(false);
    setSelectedRow(null);
    setModalError("");
  };

  const confirm = async () => {
    if (!selectedRow) return;

    const n = Number(qty);
    const max = Number(selectedRow.quantita) || 0;

    if (!Number.isFinite(n) || n <= 0) {
      setModalError("Inserisci un numero valido (> 0).");
      return;
    }

    if (modalMode === "scarico" && n > max) {
      setModalError(`Non puoi scaricare più di ${max}.`);
      return;
    }

    setBusy(true);
    setModalError("");

    try {
      const res = await fetch(`/api/magazzino/${selectedRow.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: modalMode, quantita: Math.trunc(n) }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setModalError(data?.error || "Errore aggiornamento quantità.");
        return;
      }

      if (data?.deleted) {
        setRows((prev) => prev.filter((x) => x.id !== selectedRow.id));
        closeModal();
        return;
      }

      if (data?.row) {
        setRows((prev) => prev.map((x) => (x.id === selectedRow.id ? data.row : x)));
        closeModal();
        return;
      }

      await load();
      closeModal();
    } finally {
      setBusy(false);
    }
  };

  const modalTitle = modalMode === "carico" ? "Aggiungi pezzi" : "Scarica pezzi";
  const modalVerb = modalMode === "carico" ? "aggiungendo" : "scaricando";
  const confirmLabel = modalMode === "carico" ? "Aggiungi" : "Conferma";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <h1 className={styles.heading}>Magazzino</h1>
            <p className={styles.subheading}>Visualizza e gestisci i pezzi in magazzino.</p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla Home
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {error ? <div className={styles.stateBoxError}>{error}</div> : null}

        <div className={styles.toolbar}>
          <div className={styles.counter}>Totale: {rows.length}</div>

          <div className={styles.toolbarActions}>
            <Link href="/magazzino/create" className={styles.primaryLink}>
              + Nuovo pezzo
            </Link>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colId}>ID</th>
                <th>Macro categoria</th>
                <th>Tipo pezzo</th>
                <th>Quantità</th>
                <th>Unità</th>
                <th>Rif. lavoro</th>
                <th>Data</th>
                <th className={styles.colActions}>Azioni</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className={styles.mono}>{r.id}</td>
                  <td>{r.macro_categoria || "-"}</td>
                  <td>{r.tipo_pezzo || "-"}</td>
                  <td className={styles.mono}>{r.quantita}</td>
                  <td>{r.unita || "pz"}</td>
                  <td>{r.riferimento_lavoro || "-"}</td>
                  <td className={styles.mono}>{r.data_inserimento}</td>

                  <td className={styles.colActions}>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnAdd}`}
                        onClick={() => openModal(r, "carico")}
                        title="Aggiungi quantità alla riga esistente"
                      >
                        Aggiungi
                      </button>

                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnRemove}`}
                        onClick={() => openModal(r, "scarico")}
                        disabled={(Number(r.quantita) || 0) <= 0}
                        title="Scarica pezzi"
                      >
                        Scarica
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.stateBox}>
                    Nessun pezzo in magazzino.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && selectedRow ? (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{modalTitle}</h3>
            </div>

            <div className={styles.modalBody}>
              <div>
                Stai {modalVerb} da: <b>{selectedRow.macro_categoria}</b> /{" "}
                <b>{selectedRow.tipo_pezzo}</b>
              </div>

              {modalMode === "scarico" ? (
                <div style={{ marginTop: 6 }}>
                  Disponibili: <b>{disponibili}</b> pz
                </div>
              ) : null}

              <div className={styles.modalGrid}>
                <div className={styles.modalLabel}>
                  Quantità da {modalMode === "carico" ? "aggiungere" : "scaricare"}
                </div>
                <input
                  className={styles.modalInput}
                  type="number"
                  min="1"
                  max={modalMode === "scarico" ? disponibili : undefined}
                  step="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  disabled={busy}
                />
              </div>

              {modalError ? (
                <div className={styles.stateBoxError} style={{ marginTop: 12 }}>
                  {modalError}
                </div>
              ) : null}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={closeModal}
                disabled={busy}
              >
                Annulla
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={confirm}
                disabled={busy}
              >
                {busy ? "Attendi…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

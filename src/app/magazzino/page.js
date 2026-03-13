"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Package, TrendingUp, Archive, Layers } from "lucide-react";
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
  const [modalMode, setModalMode] = useState("scarico");

  const disponibili = useMemo(
    () => Number(selectedRow?.quantita) || 0,
    [selectedRow]
  );

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
    setModalMode(mode);
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
        setRows((prev) =>
          prev.map((x) => (x.id === selectedRow.id ? data.row : x))
        );
        closeModal();
        return;
      }

      await load();
      closeModal();
    } finally {
      setBusy(false);
    }
  };

  const totalePezzi = useMemo(() => {
    return rows.reduce((sum, r) => sum + (Number(r.quantita) || 0), 0);
  }, [rows]);

  const categorie = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.macro_categoria) set.add(r.macro_categoria);
    });
    return set.size;
  }, [rows]);

  const tipologie = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => {
      if (r.tipo_pezzo) set.add(r.tipo_pezzo);
    });
    return set.size;
  }, [rows]);

  const modalTitle = modalMode === "carico" ? "Aggiungi pezzi" : "Scarica pezzi";
  const modalVerb = modalMode === "carico" ? "aggiungendo" : "scaricando";
  const confirmLabel = modalMode === "carico" ? "Aggiungi" : "Conferma";

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Magazzino</p>
            <h1 className={styles.heading}>Gestione inventario</h1>
            <p className={styles.subheading}>
              Monitora giacenze, movimenta stock e gestisci categorie di prodotto
              con operazioni di carico e scarico in tempo reale.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {error ? <div className={styles.stateBoxError}>{error}</div> : null}

        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Package size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Pezzi totali</p>
              <h3 className={styles.statValue}>{totalePezzi}</h3>
              <p className={styles.statMeta}>
                Quantità complessiva in giacenza
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Archive size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Righe inventario</p>
              <h3 className={styles.statValue}>{rows.length}</h3>
              <p className={styles.statMeta}>Voci registrate nel magazzino</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Layers size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Categorie / Tipologie</p>
              <h3 className={styles.statValue}>
                {categorie} / {tipologie}
              </h3>
              <p className={styles.statMeta}>
                Macro categorie e tipi di pezzo distinti
              </p>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <Link href="/magazzino/create" className={styles.primaryLink}>
              + Nuovo pezzo
            </Link>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Inventario completo</h2>
                <p className={styles.panelSubtitle}>
                  Vista operativa con giacenze, categorie, riferimenti lavoro e
                  operazioni di movimentazione stock.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colId}>ID</th>
                    <th>Categoria / Tipo</th>
                    <th>Giacenza</th>
                    <th>Rif. lavoro</th>
                    <th>Data inserimento</th>
                    <th className={styles.colActions}>Azioni</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className={styles.mono}>{r.id}</td>

                      <td>
                        <div className={styles.cellPrimary}>
                          {r.macro_categoria || "-"}
                        </div>
                        <div className={styles.cellSecondary}>
                          {r.tipo_pezzo || "Tipo non specificato"}
                        </div>
                      </td>

                      <td>
                        <div className={styles.cellPrimary}>
                          {r.quantita} {r.unita || "pz"}
                        </div>
                      </td>

                      <td>
                        <span className={styles.contactPill}>
                          {r.riferimento_lavoro || "-"}
                        </span>
                      </td>

                      <td>
                        <span className={styles.contactPill}>
                          {r.data_inserimento}
                        </span>
                      </td>

                      <td className={styles.actionsCell}>
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
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={styles.stateBox}>
            <p>Nessun pezzo in magazzino.</p>
          </div>
        )}
      </section>

      {modalOpen && selectedRow ? (
        <div
          className={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
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

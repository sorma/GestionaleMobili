"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2, Users, Globe, Phone } from "lucide-react";
import styles from "../../../styles/list.module.css";

export default function SellerList() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchSellers() {
      try {
        const response = await fetch("/api/sellers");

        if (!response.ok) {
          throw new Error(`Errore HTTP! status: ${response.status}`);
        }

        const data = await response.json();

        if (!active) return;
        setSellers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        setMessage(`Errore nel caricamento: ${err.message}`);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    fetchSellers();

    return () => {
      active = false;
    };
  }, []);

  const total = useMemo(() => sellers.length, [sellers]);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(
      sellers.map((s) => s.nazione).filter((n) => n && n.trim())
    );
    return countries.size;
  }, [sellers]);

  const withPhoneCount = useMemo(() => {
    return sellers.filter((s) => s.telefono && s.telefono.trim()).length;
  }, [sellers]);

  const handleDeleteSeller = async (id) => {
    const conferma = window.confirm(
      `Vuoi davvero eliminare il venditore #${id}?`
    );
    if (!conferma) return;

    try {
      const response = await fetch(`/api/sellers/${id}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Errore eliminazione venditore");
      }

      setSellers((prev) => prev.filter((seller) => seller.id !== id));
      setMessage("");
    } catch (err) {
      setMessage(`Errore: ${err.message}`);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Venditori</p>
            <h1 className={styles.heading}>Anagrafica venditori</h1>
            <p className={styles.subheading}>
              Gestisci i dati dei venditori attivi, informazioni di contatto e
              distribuzione geografica del team commerciale.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {message ? (
          <div className={styles.stateBoxError}>
            <p>{message}</p>
          </div>
        ) : null}

        <div className={styles.overviewGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Totale venditori</p>
              <h3 className={styles.statValue}>{total}</h3>
              <p className={styles.statMeta}>Venditori attivi nel sistema</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Globe size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Nazioni</p>
              <h3 className={styles.statValue}>{uniqueCountries}</h3>
              <p className={styles.statMeta}>
                Paesi con presenza commerciale
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Phone size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>Contatti disponibili</p>
              <h3 className={styles.statValue}>
                {withPhoneCount} / {total}
              </h3>
              <p className={styles.statMeta}>
                Venditori con numero di telefono
              </p>
            </div>
          </div>

          <div className={styles.ctaCard}>
            <Link href="/sellers/create" className={styles.primaryLink}>
              + Nuovo venditore
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <p>Caricamento venditori...</p>
          </div>
        ) : sellers.length > 0 ? (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>Elenco completo</h2>
                <p className={styles.panelSubtitle}>
                  Vista operativa con dati anagrafici, contatti e informazioni
                  geografiche del team vendite.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.colId}>ID</th>
                    <th>Venditore</th>
                    <th>Telefono</th>
                    <th>Nazione</th>
                    <th className={styles.colActions}>Azioni</th>
                  </tr>
                </thead>

                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller.id}>
                      <td className={styles.mono}>{seller.id}</td>

                      <td>
                        <div className={styles.cellPrimary}>
                          {seller.nome} {seller.cognome}
                        </div>
                        <div className={styles.cellSecondary}>
                          Venditore #{seller.id}
                        </div>
                      </td>

                      <td>
                        <span className={styles.contactPill}>
                          {seller.telefono || "-"}
                        </span>
                      </td>

                      <td>
                        <div className={styles.cellPrimary}>
                          {seller.nazione || "-"}
                        </div>
                      </td>

                      <td className={styles.actionsCell}>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleDeleteSeller(seller.id)}
                            className={styles.iconDangerButton}
                            aria-label={`Elimina venditore ${seller.id}`}
                            title="Elimina venditore"
                            type="button"
                          >
                            <Trash2 size={17} />
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
            <p>Nessun venditore presente</p>
          </div>
        )}
      </section>
    </main>
  );
}

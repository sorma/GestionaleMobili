"use client";

import Link from "next/link";
import { ExternalLink, Download, BookOpen, Sparkles, Clock, Shield } from "lucide-react";
import styles from "../../../../styles/cataloghi.module.css";

const ONLINE_URL =
  "https://pdf-flip.arredo3.it/arredo3-catalogo-collection-cucine/?_gl=1*3d9k83*_gcl_aw*R0NMLjE3NzEyNDc5NDkuQ2p3S0NBaUFuY3ZNQmhCRUVpd0E5R1VfZnU0V2JfUHVzdlh5RkJ4b3RpZGtMdGp4a2M5bm1wcFRUaDZBOHpwbVowX05XVGI1LUhvcUN4b0NoLThRQXZEX0J3RQ..*_gcl_au*ODg2NTU3NDA4LjE3NzEyNDc3MjY.";

const OFFLINE_PDF = "/cataloghi/arredo3.pdf";

export default function CatalogoArredo3Page() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Risorse Commerciali</p>
            <h1 className={styles.heading}>Catalogo Arredo3 Collection</h1>
            <p className={styles.subheading}>
              Catalogo ufficiale cucine Arredo3 - Edizione corrente con tutte le finiture, modelli e configurazioni disponibili.
            </p>
          </div>

          <Link href="/" className={styles.backButton}>
            ← Torna alla dashboard
          </Link>
        </div>
      </header>

      <section className={styles.content}>
        {/* Hero Section */}
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              <span>Aggiornato 2026</span>
            </div>
            <h2 className={styles.heroTitle}>
              Catalogo Collection Cucine
            </h2>
            <p className={styles.heroDescription}>
              Scopri l'intera gamma Arredo3 con modelli esclusivi, finiture premium 
              e soluzioni innovative per ogni stile di cucina. Disponibile in versione 
              interattiva online e PDF scaricabile.
            </p>
          </div>
        </div>

        {/* Main Options Grid */}
        <div className={styles.optionsGrid}>
          {/* Versione Online */}
          <div className={styles.optionCard}>
            <div className={styles.optionCardHeader}>
              <div className={styles.optionIconLarge}>
                <ExternalLink size={24} />
              </div>
              <div className={styles.recommendedBadge}>
                Consigliato
              </div>
            </div>

            <h3 className={styles.optionTitle}>Catalogo Online Interattivo</h3>
            <p className={styles.optionDescription}>
              Esperienza di lettura ottimale con zoom, ricerca integrata e 
              aggiornamenti automatici. Sempre la versione più recente.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <Clock size={16} />
                <span>Sempre aggiornato</span>
              </div>
              <div className={styles.featureItem}>
                <BookOpen size={16} />
                <span>Sfogliabile interattivo</span>
              </div>
              <div className={styles.featureItem}>
                <Sparkles size={16} />
                <span>Qualità HD</span>
              </div>
            </div>

            <a
              href={ONLINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.optionButtonPrimary}
            >
              <ExternalLink size={18} />
              Apri Catalogo Online
            </a>
          </div>

          {/* Versione PDF */}
          <div className={styles.optionCard}>
            <div className={styles.optionCardHeader}>
              <div className={styles.optionIconLarge} style={{ background: "rgba(241, 245, 249, 0.8)" }}>
                <Download size={24} />
              </div>
            </div>

            <h3 className={styles.optionTitle}>Download PDF Offline</h3>
            <p className={styles.optionDescription}>
              Versione scaricabile per consultazione senza connessione. 
              Ideale per presentazioni clienti in mobilità.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <Shield size={16} />
                <span>Disponibile offline</span>
              </div>
              <div className={styles.featureItem}>
                <Download size={16} />
                <span>Salva sul dispositivo</span>
              </div>
              <div className={styles.featureItem}>
                <BookOpen size={16} />
                <span>Stampa pagine</span>
              </div>
            </div>

            <div className={styles.optionButtonGroup}>
              <a
                href={OFFLINE_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.optionButton}
              >
                Visualizza
              </a>
              <a
                href={OFFLINE_PDF}
                download="Arredo3_Catalogo_Collection.pdf"
                className={styles.optionButton}
              >
                <Download size={16} />
                Scarica
              </a>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Contenuti del catalogo</h2>
              <p className={styles.panelSubtitle}>
                Panoramica completa delle informazioni disponibili
              </p>
            </div>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h4 className={styles.infoItemTitle}>Modelli e Composizioni</h4>
                <ul className={styles.infoList}>
                  <li>Gamma completa cucine moderne</li>
                  <li>Soluzioni classiche e contemporanee</li>
                  <li>Configurazioni angolari e lineari</li>
                  <li>Isole e penisole cucina</li>
                </ul>
              </div>

              <div className={styles.infoItem}>
                <h4 className={styles.infoItemTitle}>Finiture e Materiali</h4>
                <ul className={styles.infoList}>
                  <li>Ante laccate opache e lucide</li>
                  <li>Essenze legno e melaminici</li>
                  <li>Top in quarzo, ceramica, laminato</li>
                  <li>Maniglie e gole integrate</li>
                </ul>
              </div>

              <div className={styles.infoItem}>
                <h4 className={styles.infoItemTitle}>Informazioni Tecniche</h4>
                <ul className={styles.infoList}>
                  <li>Schede tecniche dettagliate</li>
                  <li>Dimensioni e modularità</li>
                  <li>Accessori e complementi</li>
                  <li>Listino prezzi ufficiale</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className={styles.helpCard}>
          <h3 className={styles.helpTitle}>Hai bisogno di assistenza?</h3>
          <p className={styles.helpText}>
            Per informazioni su modelli specifici, disponibilità finiture o supporto 
            tecnico, contatta il tuo referente commerciale Arredo3 o consulta la 
            documentazione tecnica disponibile nella sezione risorse.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { ExternalLink, Download, BookOpen, Sparkles, Clock, Shield } from "lucide-react";
import styles from "../../../../styles/cataloghi.module.css";

const ONLINE_URL =
  "https://tagliabuemobili.com/pdf/Tagliabue_New_interior_perspectives.pdf";

const OFFLINE_PDF = "/cataloghi/tagliabue.pdf";

export default function CatalogoTagliabuePage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div>
            <p className={styles.pageEyebrow}>Risorse Commerciali</p>
            <h1 className={styles.heading}>Catalogo Tagliabue Mobili</h1>
            <p className={styles.subheading}>
              Catalogo ufficiale New Interior Perspectives - Collezione completa arredamento contemporaneo e soluzioni d'interior design.
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
              <span>New Interior Perspectives</span>
            </div>
            <h2 className={styles.heroTitle}>
              Catalogo Collezione Completa
            </h2>
            <p className={styles.heroDescription}>
              Esplora l'universo Tagliabue Mobili con soluzioni innovative per living, 
              zona notte, ufficio e contract. Design italiano, qualità artigianale e 
              personalizzazione totale per ogni progetto d'arredo.
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

            <h3 className={styles.optionTitle}>Catalogo Online Ufficiale</h3>
            <p className={styles.optionDescription}>
              Accedi al catalogo direttamente dal sito Tagliabue Mobili. 
              Versione sempre aggiornata con le ultime novità di collezione.
            </p>

            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <Clock size={16} />
                <span>Sempre aggiornato</span>
              </div>
              <div className={styles.featureItem}>
                <BookOpen size={16} />
                <span>Qualità ottimale</span>
              </div>
              <div className={styles.featureItem}>
                <Sparkles size={16} />
                <span>Contenuti esclusivi</span>
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
              Versione PDF salvata localmente per consultazione senza connessione. 
              Perfetta per presentazioni clienti in mobilità.
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
                download="Tagliabue_New_Interior_Perspectives.pdf"
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
                Panoramica completa delle collezioni e soluzioni d'arredo
              </p>
            </div>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h4 className={styles.infoItemTitle}>Zona Giorno</h4>
                <ul className={styles.infoList}>
                  <li>Soggiorni e pareti attrezzate</li>
                  <li>Librerie componibili modulari</li>
                  <li>Madie e contenitori living</li>
                  <li>Tavoli e sedie design</li>
                </ul>
              </div>

              <div className={styles.infoItem}>
                <h4 className={styles.infoItemTitle}>Zona Notte</h4>
                <ul className={styles.infoList}>
                  <li>Camere matrimoniali complete</li>
                  <li>Armadi battenti e scorrevoli</li>
                  <li>Cabine armadio su misura</li>
                  <li>Complementi notte design</li>
                </ul>
              </div>

              <div className={styles.infoItem}>
                <h4 className={styles.infoItemTitle}>Ufficio & Contract</h4>
                <ul className={styles.infoList}>
                  <li>Home office e smart working</li>
                  <li>Librerie professionali</li>
                  <li>Soluzioni contract progetti</li>
                  <li>Personalizzazioni su misura</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className={styles.helpCard}>
          <h3 className={styles.helpTitle}>Hai bisogno di assistenza?</h3>
          <p className={styles.helpText}>
            Per informazioni su modelli specifici, disponibilità finiture, tempi di 
            consegna o preventivi personalizzati, contatta il tuo referente commerciale 
            Tagliabue Mobili o consulta la documentazione tecnica nella sezione risorse.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function DisegnoFullScreenPage() {
  const searchParams = useSearchParams();
  const src = searchParams.get("src");
  const cliente = searchParams.get("cliente");

  const safe = useMemo(() => {
    if (!src) return { ok: false, src: null };
    // accetta solo immagini dalla tua cartella pubblica uploads
    if (!src.startsWith("/uploads/ordini/")) return { ok: false, src: null };
    return { ok: true, src };
  }, [src]);

  const titolo = useMemo(() => {
    const c = (cliente || "").trim();
    return c ? `Disegno ordine - ${c}` : "Disegno ordine";
  }, [cliente]);

  if (!safe.ok) {
    return (
      <main style={{ padding: 24 }}>
        <p>Disegno non disponibile.</p>
        <Link href="/orders">← Torna agli ordini</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        background: "#0b0f19",
        display: "flex",
        flexDirection: "column",
      }}
    >
    <header
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // centro orizzontale [web:165]
        padding: "12px 16px",
        color: "white",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
    }}
    >
    <strong
        style={{
        textAlign: "center", // centra il testo nel suo box [web:166]
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        }}
    >
        {titolo}
    </strong>
    </header>


      {/* Contenitore che occupa tutta l’area rimanente */}
      <div
        style={{
          flex: 1,
          padding: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={safe.src}
          alt={titolo}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",      // mostra tutta l’immagine senza tagli [web:143]
            objectPosition: "center",
            display: "block",
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
    </main>
  );
}

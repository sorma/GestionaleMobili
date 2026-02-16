"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaUsers,
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaWrench,
  FaTools,
  FaInfoCircle,
  FaCalendarAlt,
  FaWarehouse,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdPeopleAlt, MdPersonAdd } from "react-icons/md";
import { FaTruck } from "react-icons/fa";
import { FaBook } from "react-icons/fa"; // <-- aggiungi tra gli import (in alto)


const BORDER_CLASS = {
  indigo: "border-l-indigo-600",
  purple: "border-l-purple-600",
  emerald: "border-l-emerald-600",
  orange: "border-l-orange-600",
  gray: "border-l-slate-500",
};

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sfondo */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/images/bg-mobili.jpg')" }}
        />
        <div className="absolute inset-0 bg-white/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/70" />
      </div>

      {/* Contenuto */}
      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-12">
        {/* Header */}
        <header className="relative z-10 -mx-4 md:-mx-12 mb-10 border-b border-slate-200/90 bg-white/75 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-12">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-3 text-slate-700">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/80 backdrop-blur">
                    <FaHome className="text-lg text-slate-700" />
                  </span>
                  <span className="text-sm font-medium tracking-wide uppercase">
                    Gestionale
                  </span>
                </div>

                <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                  Arredamenti <span className="text-slate-700">Sormani</span>
                </h1>

                <p className="mt-2 max-w-2xl text-base text-slate-600">
                  Accesso rapido alle funzioni principali.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white hover:border-slate-300 transition-colors"
                >
                  <FaCalendarAlt className="text-slate-700" />
                  Calendario
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 backdrop-blur px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white hover:border-slate-300 transition-colors cursor-pointer"
                  type="button"
                >
                  <FaSignOutAlt className="text-slate-700" />
                  Esci
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Sezioni */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Group title="Ordini" tone="indigo">
            <Card
              href="/orders/create"
              icon={<FaClipboardList />}
              title="Nuovo ordine"
              badge="Crea"
            />
            <Card
              href="/orders"
              icon={<FaClipboardList />}
              title="Lista ordini"
              badge="Elenco"
            />
          </Group>

          <Group title="Clienti" tone="purple">
            <Card href="/clients/create" icon={<FaUser />} title="Nuovo cliente" badge="Crea" />
            <Card href="/clients" icon={<FaUsers />} title="Lista clienti" badge="Elenco" />
          </Group>

          <Group title="Venditori" tone="emerald">
            <Card href="/sellers/create" icon={<MdPersonAdd />} title="Nuovo venditore" badge="Crea" />
            <Card href="/sellers" icon={<MdPeopleAlt />} title="Lista venditori" badge="Elenco" />
          </Group>

          <Group title="Montaggi" tone="orange">
            <Card href="/montaggi/create" icon={<FaWrench />} title="Nuovo montaggio" badge="Crea" />
            <Card href="/montaggi" icon={<FaTools />} title="Lista montaggi" badge="Elenco" />
          </Group>

          <Group title="Magazzino" tone="indigo">
            <Card href="/magazzino/create" icon={<FaWarehouse />} title="Nuovo carico" badge="Crea" />
            <Card href="/magazzino" icon={<FaWarehouse />} title="Lista magazzino" badge="Elenco" />
          </Group>

          <Group title="Report & statistiche" tone="gray">
            <Card href="/reports" icon={<FaChartBar />} title="Report ordini" />
            <Card href="/montaggi/reports" icon={<FaInfoCircle />} title="Report montaggi" />
          </Group>

          <Group title="Mezzi da lavoro" tone="emerald">
            <Card href="/mezzi/create" icon={<FaTruck />} title="Nuovo mezzo" badge="Crea" />
            <Card href="/mezzi" icon={<FaClipboardList />} title="Lista mezzi" badge="Elenco" />
          </Group>

          <Group title="Costi" tone="gray">
            <Card href="/costi/create" icon={<FaChartBar />} title="Nuovo costo" badge="Crea" />
            <Card href="/costi" icon={<FaClipboardList />} title="Lista costi" badge="Elenco" />
          </Group>

          <Group title="Guadagni" tone="indigo">
            <Card href="/guadagni" icon={<FaChartBar />} title="Guadagni effettivi" badge="Report" />
          </Group>

          {/* ✅ NUOVO GRUPPO: Appuntamenti (card come le altre) */}
          <Group title="Appuntamenti" tone="indigo">
            <Card
              href="/appuntamenti/create"
              icon={<FaCalendarAlt />}
              title="Nuovo appuntamento"
              badge="Crea"
            />
            <Card
              href="/appuntamenti"
              icon={<FaCalendarAlt />}
              title="Agenda appuntamenti"
              badge="Elenco"
            />
          </Group>

          <Group title="Cataloghi" tone="purple">
            <Card
              href="/cataloghi/arredo3"
              icon={<FaBook />}
              title="Catalogo Arredo3"
              badge="Apri"
            />
            <Card
              href="/cataloghi/tagliabue"
              icon={<FaBook />}
              title="Catalogo Tagliabue"
              badge="Apri"
            />
          </Group>

        </section>
      </div>
    </main>
  );
}

function Group({ title, tone, children }) {
  const border = BORDER_CLASS[tone] ?? "border-l-slate-500";

  return (
    <div
      className={[
        "rounded-xl bg-white/85 backdrop-blur shadow-sm ring-1 ring-slate-200",
        "border-l-4",
        border,
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="grid gap-2 p-3">{children}</div>
    </div>
  );
}
function Card({ href, icon, title, badge }) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-start gap-3 rounded-lg border border-slate-200 bg-white/90 backdrop-blur",
        "px-4 py-3",
        "transition-all duration-150",
        "hover:bg-white hover:border-slate-300 hover:shadow-sm hover:-translate-y-[1px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/60",
      ].join(" ")}
    >
      <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-200/70">
        <span className="text-lg">{icon}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {title}
          </h3>

          {badge ? (
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 group-hover:border-slate-300">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}


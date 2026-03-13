"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaWrench,
  FaTools,
  FaInfoCircle,
  FaCalendarAlt,
  FaWarehouse,
  FaSignOutAlt,
  FaTruck,
  FaBook,
  FaChevronRight,
} from "react-icons/fa";
import { MdPeopleAlt, MdPersonAdd } from "react-icons/md";
import { FaUser, FaUsers } from "react-icons/fa";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: <FaHome /> },
  { label: "Ordini", href: "/orders", icon: <FaClipboardList /> },
  { label: "Clienti", href: "/clients", icon: <FaUsers /> },
  { label: "Venditori", href: "/sellers", icon: <MdPeopleAlt /> },
  { label: "Montaggi", href: "/montaggi", icon: <FaTools /> },
  { label: "Magazzino", href: "/magazzino", icon: <FaWarehouse /> },
  { label: "Appuntamenti", href: "/appuntamenti", icon: <FaCalendarAlt /> },
  { label: "Mezzi", href: "/mezzi", icon: <FaTruck /> },
  { label: "Costi", href: "/costi", icon: <FaChartBar /> },
  { label: "Guadagni", href: "/guadagni", icon: <FaChartBar /> },
];

const QUICK_ACTIONS = [
  {
    title: "Nuovo ordine",
    description: "Inserimento rapido di un nuovo ordine cliente",
    href: "/orders/create",
    icon: <FaClipboardList />,
  },
  {
    title: "Nuovo appuntamento",
    description: "Agenda showroom e appuntamenti commerciali",
    href: "/appuntamenti/create",
    icon: <FaCalendarAlt />,
  },
  {
    title: "Nuovo montaggio",
    description: "Programmazione e registrazione attività di montaggio",
    href: "/montaggi/create",
    icon: <FaWrench />,
  },
  {
    title: "Nuovo cliente",
    description: "Creazione anagrafica cliente",
    href: "/clients/create",
    icon: <FaUser />,
  },
];

const SECTIONS = [
  {
    title: "Operatività",
    description: "Attività principali del flusso quotidiano.",
    items: [
      {
        name: "Ordini",
        icon: <FaClipboardList />,
        actions: [
          { label: "Nuovo", href: "/orders/create" },
          { label: "Elenco", href: "/orders" },
        ],
      },
      {
        name: "Montaggi",
        icon: <FaTools />,
        actions: [
          { label: "Nuovo", href: "/montaggi/create" },
          { label: "Elenco", href: "/montaggi" },
        ],
      },
      {
        name: "Appuntamenti",
        icon: <FaCalendarAlt />,
        actions: [
          { label: "Nuovo", href: "/appuntamenti/create" },
          { label: "Agenda", href: "/appuntamenti" },
        ],
      },
    ],
  },
  {
    title: "Anagrafiche",
    description: "Gestione soggetti e relazioni commerciali.",
    items: [
      {
        name: "Clienti",
        icon: <FaUsers />,
        actions: [
          { label: "Nuovo", href: "/clients/create" },
          { label: "Elenco", href: "/clients" },
        ],
      },
      {
        name: "Venditori",
        icon: <MdPersonAdd />,
        actions: [
          { label: "Nuovo", href: "/sellers/create" },
          { label: "Elenco", href: "/sellers" },
        ],
      },
      {
        name: "Cataloghi",
        icon: <FaBook />,
        actions: [
          { label: "Arredo3", href: "/cataloghi/arredo3" },
          { label: "Tagliabue", href: "/cataloghi/tagliabue" },
        ],
      },
    ],
  },
  {
    title: "Logistica e controllo",
    description: "Magazzino, mezzi, costi e analisi economiche.",
    items: [
      {
        name: "Magazzino",
        icon: <FaWarehouse />,
        actions: [
          { label: "Nuovo", href: "/magazzino/create" },
          { label: "Elenco", href: "/magazzino" },
        ],
      },
      {
        name: "Mezzi",
        icon: <FaTruck />,
        actions: [
          { label: "Nuovo", href: "/mezzi/create" },
          { label: "Elenco", href: "/mezzi" },
        ],
      },
      {
        name: "Costi",
        icon: <FaChartBar />,
        actions: [
          { label: "Nuovo", href: "/costi/create" },
          { label: "Elenco", href: "/costi" },
        ],
      },
      {
        name: "Report ordini",
        icon: <FaInfoCircle />,
        actions: [{ label: "Apri report", href: "/reports" }],
      },
      {
        name: "Report montaggi",
        icon: <FaInfoCircle />,
        actions: [{ label: "Apri report", href: "/montaggi/reports" }],
      },
      {
        name: "Guadagni",
        icon: <FaChartBar />,
        actions: [{ label: "Apri report", href: "/guadagni" }],
      },
    ],
  },
];

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
    <main className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                <FaHome className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Gestionale
                </p>
                <h1 className="text-base font-semibold text-slate-900">
                  Arredamenti Sormani
                </h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-5">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <SidebarLink
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={item.href === "/"}
                />
              ))}
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
                <FaSignOutAlt />
              </span>
              Esci
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Dashboard
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  Pannello operativo
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Accesso rapido ai moduli principali del gestionale.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  <FaCalendarAlt className="text-slate-600" />
                  Calendario
                </Link>

                <button
                  onClick={handleLogout}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 lg:hidden"
                >
                  <FaSignOutAlt className="text-slate-600" />
                  Esci
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Azioni rapide
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Collegamenti diretti alle operazioni più frequenti.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {QUICK_ACTIONS.map((action) => (
                  <QuickActionCard
                    key={action.title}
                    href={action.href}
                    icon={action.icon}
                    title={action.title}
                    description={action.description}
                  />
                ))}
              </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-3">
              {SECTIONS.map((section) => (
                <SectionPanel
                  key={section.title}
                  title={section.title}
                  description={section.description}
                  items={section.items}
                />
              ))}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function SidebarLink({ href, icon, label, active = false }) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 items-center justify-center rounded-md border text-sm",
          active
            ? "border-slate-800 bg-slate-800 text-white"
            : "border-slate-200 bg-white text-slate-600",
        ].join(" ")}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

function QuickActionCard({ href, icon, title, description }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
            <FaChevronRight className="text-xs text-slate-400 transition group-hover:text-slate-600" />
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function SectionPanel({ title, description, items }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((item) => (
          <ActionRow
            key={item.name}
            icon={item.icon}
            name={item.name}
            actions={item.actions}
          />
        ))}
      </div>
    </section>
  );
}

function ActionRow({ icon, name, actions }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

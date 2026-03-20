"use client";

import Link from "next/link";
import {
  FaClipboardList,
  FaChartBar,
  FaWrench,
  FaTools,
  FaInfoCircle,
  FaCalendarAlt,
  FaWarehouse,
  FaTruck,
  FaBook,
  FaChevronRight,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";

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
        actions: [{ label: "Apri report", href: "/reports/ordini" }],
      },
      {
        name: "Report montaggi",
        icon: <FaInfoCircle />,
        actions: [{ label: "Apri report", href: "/reports/montaggi" }],
      },
      {
        name: "Guadagni",
        icon: <FaChartBar />,
        actions: [{ label: "Apri report", href: "/guadagni" }],
      },
    ],
  },
];

export default function HomePage() {
  return (
    <>
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
    </>
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

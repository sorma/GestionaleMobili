"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaTools,
  FaCalendarAlt,
  FaWarehouse,
  FaSignOutAlt,
  FaTruck,
  FaChevronRight,
  FaUsers,
  FaBook,
  FaInfoCircle,
} from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";

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
  { label: "Report ordini", href: "/reports/ordini", icon: <FaInfoCircle /> },
  { label: "Report montaggi", href: "/reports/montaggi", icon: <FaInfoCircle /> },
  { label: "Cataloghi", href: "/cataloghi/arredo3", icon: <FaBook /> },
];

export default function PanelLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9]/90 text-slate-900">
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
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <SidebarLink
                    key={item.label}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={active}
                  />
                );
              })}
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
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
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
            {children}
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
      {active ? <FaChevronRight className="ml-auto text-[11px]" /> : null}
    </Link>
  );
}

import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Arredamenti Sormani",
  description: "Gestionale per arredamenti",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="relative min-h-screen w-full overflow-hidden">
          {/* Sfondo globale (vale per TUTTE le pagine) */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/bg-mobili.jpg')" }}
            />
            {/* Regola questi valori se lo vuoi più visibile */}
            <div className="absolute inset-0 bg-white/70" />
            <div className="absolute inset-0 bg-slate-900/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/30" />
          </div>

          {/* Contenuto */}
          <div className="min-h-screen w-full">{children}</div>
        </div>
      </body>
    </html>
  );
}

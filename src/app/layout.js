import './globals.css'; // O il tuo file CSS globale
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Arredamenti Sormani',
  description: 'Gestionale per arredamenti',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
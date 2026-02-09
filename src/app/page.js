import Link from 'next/link';
import {
  FaPlus, FaList, FaUser, FaUsers, FaHome, FaClipboardList,
  FaChartBar, FaWrench, FaTools, FaInfoCircle, FaCalendarAlt
} from 'react-icons/fa';
import { MdPeopleAlt, MdPersonAdd } from 'react-icons/md';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-10 px-4 md:px-12">
      {/* Header */}
      <header className="text-center mb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center bg-indigo-100 p-5 rounded-full shadow-md mb-6">
          <FaHome className="text-4xl text-indigo-700" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
          Arredamenti <span className="text-indigo-600">Sormani</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
          Gestione centralizzata e intuitiva per tutte le operazioni aziendali.
        </p>
      </header>

      {/* Sezioni */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {/* Ordini */}
        <Group title="Ordini" borderColor="indigo-500">
          <Card
            href="/orders/create"
            mainIcon={<FaClipboardList />}
            actionType="create"
            title="Nuovo Ordine"
            description="Registra un nuovo ordine"
            bgColor="bg-indigo-600"
            hoverColor="hover:bg-indigo-700"
          />
          <Card
            href="/orders"
            mainIcon={<FaClipboardList />}
            actionType="list"
            title="Lista Ordini"
            description="Gestisci tutti gli ordini"
            bgColor="bg-blue-600"
            hoverColor="hover:bg-blue-700"
          />
        </Group>

        {/* Clienti */}
        <Group title="Clienti" borderColor="purple-500">
          <Card
            href="/clients/create"
            mainIcon={<FaUser />}
            actionType="create"
            title="Nuovo Cliente"
            description="Aggiungi un nuovo cliente"
            bgColor="bg-purple-600"
            hoverColor="hover:bg-purple-700"
          />
          <Card
            href="/clients"
            mainIcon={<FaUsers />}
            actionType="list"
            title="Lista Clienti"
            description="Visualizza e gestisci i clienti"
            bgColor="bg-fuchsia-600"
            hoverColor="hover:bg-fuchsia-700"
          />
        </Group>

        {/* Venditori */}
        <Group title="Venditori" borderColor="emerald-500">
          <Card
            href="/sellers/create"
            mainIcon={<MdPersonAdd />}
            actionType="create"
            title="Nuovo Venditore"
            description="Aggiungi un nuovo venditore"
            bgColor="bg-emerald-600"
            hoverColor="hover:bg-emerald-700"
          />
          <Card
            href="/sellers"
            mainIcon={<MdPeopleAlt />}
            actionType="list"
            title="Lista Venditori"
            description="Gestisci il team di vendita"
            bgColor="bg-teal-600"
            hoverColor="hover:bg-teal-700"
          />
        </Group>

        {/* Montaggi */}
        <Group title="Montaggi" borderColor="orange-500">
          <Card
            href="/montaggi/create"
            mainIcon={<FaWrench />}
            actionType="create"
            title="Nuovo Montaggio"
            description="Registra un nuovo montaggio per i clienti"
            bgColor="bg-stone-600"
            hoverColor="hover:bg-stone-700"
          />
          <Card
            href="/montaggi"
            mainIcon={<FaTools />}
            actionType="list"
            title="Lista Montaggi"
            description="Gestisci gli interventi di montaggio"
            bgColor="bg-orange-600"
            hoverColor="hover:bg-orange-700"
          />
        </Group>

        {/* Report */}
        <Group title="Report & Statistiche" borderColor="gray-500">
          <Card
            href="/reports"
            mainIcon={<FaChartBar />}
            title="Report & Statistiche Ordini"
            description="Accedi a dati e analisi aziendali degli ordini"
            bgColor="bg-cyan-600"
            hoverColor="hover:bg-cyan-700"
          />
          <Card
            href="/montaggi/reports"
            mainIcon={<FaInfoCircle />}
            title="Report & Statistiche Montaggi"
            description="Accedi a dati e analisi aziendali dei montaggi"
            bgColor="bg-gray-600"
            hoverColor="hover:bg-gray-700"
          />
        </Group>

        {/* Calendario - Nuova Sezione */}
        <Group title="Calendario" borderColor="pink-500">
          <Card
            href="/calendar"
            mainIcon={<FaCalendarAlt />}
            title="Calendario Appuntamenti"
            description="Visualizza ordini e montaggi sul calendario"
            bgColor="bg-pink-600"
            hoverColor="hover:bg-pink-700"
          />
        </Group>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-600 text-sm">
        <p className="mb-2">&copy; {new Date().getFullYear()} Arredamenti Sormani. Tutti i diritti riservati.</p>
        <div className="flex justify-center space-x-6 text-gray-500">
          <Link href="#" className="hover:text-indigo-600 transition duration-200">Termini di Servizio</Link>
          <Link href="#" className="hover:text-indigo-600 transition duration-200">Politica Privacy</Link>
          <Link href="#" className="hover:text-indigo-600 transition duration-200">Contatti</Link>
        </div>
      </footer>
    </main>
  );
}

// Group Component
function Group({ title, borderColor, children }) {
  return (
    <div className={`space-y-4 p-4 bg-white rounded-xl shadow-md border border-gray-100`}>
      <h2 className={`text-2xl font-bold text-gray-800 border-l-4 pl-4 border-${borderColor}`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-3">{children}</div>
    </div>
  );
}

// Card Component
function Card({ href, mainIcon, actionType, title, description, bgColor, hoverColor }) {
  const getActionIcon = () => {
    if (actionType === 'create') return <FaPlus />;
    if (actionType === 'list') return <FaList />;
    return null;
  };

  return (
    <Link
      href={href}
      className={`${bgColor} ${hoverColor} text-white rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] p-4 min-h-[130px] flex items-start space-x-4`}
    >
      <div className="relative flex-shrink-0 bg-white bg-opacity-20 rounded-full p-3 text-2xl shadow-inner flex items-center justify-center">
        {mainIcon}
        {actionType && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 text-sm text-gray-800 shadow-md">
            {getActionIcon()}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1 leading-tight">{title}</h3>
        <p className="text-sm opacity-90 leading-normal">{description}</p>
      </div>
    </Link>
  );
}

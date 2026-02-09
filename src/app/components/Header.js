import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-800 text-white py-4 text-center">
      <div className="container mx-auto">
        <Link href="/" className="text-xl font-bold">
          Arredamenti Sormani
        </Link>
      </div>
    </header>
  );
}
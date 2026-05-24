import Link from 'next/link';

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="h-10 border-b bg-white flex items-center px-4">
        <Link
          href="/modulos"
          className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800 transition-colors"
        >
          ← Módulos
        </Link>
      </div>
      {children}
    </>
  );
}

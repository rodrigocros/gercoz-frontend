'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  CASHIER: 'Caixa',
  COOK: 'Cozinheiro',
};

export default function EmpresasPage() {
  const { user, empresas, selectEmpresa, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (restaurantId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await selectEmpresa(restaurantId);
      router.push('/modulos');
    } catch {
      setLoading(false);
      // silently reset loading — user can retry
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold">
            {user?.name || 'Selecione sua empresa'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
        >
          Sair
        </button>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6">
        <h1 className="text-lg font-semibold mb-2">Selecione a empresa</h1>
        <p className="text-sm text-gray-500 mb-8">Escolha em qual empresa você quer trabalhar</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          {empresas.map((empresa) => (
            <button
              key={empresa.id}
              onClick={() => handleSelect(empresa.id)}
              disabled={loading}
              className={`bg-white border border-gray-200 rounded-xl p-6 text-center transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:shadow-sm cursor-pointer'
              }`}
            >
              <div className="text-base font-semibold">{empresa.nome}</div>
              <div className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded mt-2 inline-block">
                {ROLE_LABELS[empresa.role] ?? empresa.role}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

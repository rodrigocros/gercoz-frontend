'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  CASHIER: 'Caixa',
  COOK: 'Cozinheiro',
};

interface Module {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
}

const MODULE_CONFIG: Record<string, Module[]> = {
  ADMIN: [
    { title: 'Dashboard', subtitle: 'Análises', icon: '📊', href: '/dashboard' },
    { title: 'Produtos', subtitle: 'Cardápio', icon: '🍽️', href: '/products' },
    { title: 'Ingredientes', subtitle: 'Estoque', icon: '🧂', href: '/ingredients' },
    { title: 'PDV', subtitle: 'Ponto de venda', icon: '🛒', href: '/pdv' },
    { title: 'Pedidos', subtitle: 'Em aberto', icon: '📋', href: '/pdv/orders' },
    { title: 'Cardápio', subtitle: 'Menu digital', icon: '🍕', href: '/menu' },
    { title: 'KDS', subtitle: 'Cozinha', icon: '👨‍🍳', href: '/kds' },
  ],
  CASHIER: [
    { title: 'PDV', subtitle: 'Ponto de venda', icon: '🛒', href: '/pdv' },
    { title: 'Pedidos', subtitle: 'Em aberto', icon: '📋', href: '/pdv/orders' },
    { title: 'Cardápio', subtitle: 'Menu digital', icon: '🍕', href: '/menu' },
  ],
  COOK: [
    { title: 'KDS', subtitle: 'Cozinha', icon: '👨‍🍳', href: '/kds' },
  ],
};

export default function ModulosPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const modules = MODULE_CONFIG[user.role] ?? [];
  const colsClass = modules.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3';

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{user.name}</span>
          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">
            {ROLE_LABELS[user.role] ?? user.role}
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
        <p className="text-sm text-gray-500 mb-8">Selecione um módulo</p>
        <div className={`grid ${colsClass} gap-4 w-full max-w-lg`}>
          {modules.map((mod) => (
            <button
              key={mod.href}
              onClick={() => router.push(mod.href)}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className="text-3xl mb-2">{mod.icon}</div>
              <div className="text-sm font-semibold">{mod.title}</div>
              <div className="text-xs text-gray-500 mt-1">{mod.subtitle}</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Empresa {
  id: string;
  nome: string;
  role: string;
}

interface User {
  userId: string;
  restaurantId: string;
  role: string;
  name: string;
}

interface AuthContextValue {
  partialToken: string | null;
  empresas: Empresa[];
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  selectEmpresa: (restaurantId: string) => Promise<void>;
  switchEmpresa: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

function decodeToken(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return { userId: payload.sub, restaurantId: payload.restaurantId, role: payload.role, name: payload.name ?? '' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partialToken, setPartialToken] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const router = useRouter();

  useEffect(() => {
    const access = localStorage.getItem('accessToken');
    if (access) {
      try {
        setUser(decodeToken(access));
        document.cookie = `accessToken=${access}; path=/; max-age=900; SameSite=Strict`;
        return;
      } catch {
        localStorage.removeItem('accessToken');
      }
    }
    const partial = localStorage.getItem('partialToken');
    if (partial) {
      try {
        JSON.parse(atob(partial.split('.')[1]));
        setPartialToken(partial);
        document.cookie = `partialToken=${partial}; path=/; max-age=604800; SameSite=Strict`;
        // Can't restore empresas list without an API call — leave as empty (middleware will redirect to /empresas)
      } catch {
        localStorage.removeItem('partialToken');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('partialToken', data.partialToken);
    document.cookie = `partialToken=${data.partialToken}; path=/; max-age=604800; SameSite=Strict`;
    setPartialToken(data.partialToken);
    setEmpresas(data.empresas);
    // Do NOT navigate — caller handles navigation
  };

  const selectEmpresa = async (restaurantId: string) => {
    const { data } = await api.post(
      '/auth/select-empresa',
      { restaurantId },
      { headers: { Authorization: 'Bearer ' + partialToken } },
    );
    localStorage.setItem('accessToken', data.accessToken);
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900; SameSite=Strict`;
    localStorage.setItem('refreshToken', data.refreshToken);
    try {
      setUser(decodeToken(data.accessToken));
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      document.cookie = 'accessToken=; path=/; max-age=0';
      throw new Error('Invalid token received from server');
    }
    // Do NOT navigate
  };

  const switchEmpresa = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; max-age=0';
    setUser(null);
    // keep partialToken + empresas state intact
    router.push('/empresas');
  };

  const logout = () => {
    api.post('/auth/logout', { token: localStorage.getItem('refreshToken') }).catch(() => {});
    localStorage.clear();
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'partialToken=; path=/; max-age=0';
    setUser(null);
    setPartialToken(null);
    setEmpresas([]);
  };

  return (
    <AuthContext.Provider value={{ partialToken, empresas, user, login, selectEmpresa, switchEmpresa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { render, screen, fireEvent } from '@testing-library/react';
import HubPage from './page';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

jest.mock('@/contexts/auth-context');
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

const mockLogout = jest.fn();
const mockPush = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

function renderWithRole(role: string, name = 'Teste') {
  (useAuth as jest.Mock).mockReturnValue({
    user: { userId: '1', restaurantId: 'r1', role, name },
    logout: mockLogout,
  });
  render(<HubPage />);
}

describe('HubPage', () => {
  it('renders nothing when user is null', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, logout: mockLogout });
    const { container } = render(<HubPage />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows user name and role badge in header', () => {
    renderWithRole('ADMIN', 'João Silva');
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows correct modules for ADMIN', () => {
    renderWithRole('ADMIN');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Ingredientes')).toBeInTheDocument();
  });

  it('shows correct modules for CASHIER', () => {
    renderWithRole('CASHIER');
    expect(screen.getByText('PDV')).toBeInTheDocument();
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
    expect(screen.getByText('Cardápio')).toBeInTheDocument();
  });

  it('shows correct modules for COOK', () => {
    renderWithRole('COOK');
    expect(screen.getByText('KDS')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('navigates to module route when card is clicked', () => {
    renderWithRole('ADMIN');
    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('calls logout and redirects to /auth when Sair is clicked', () => {
    renderWithRole('ADMIN');
    fireEvent.click(screen.getByRole('button', { name: /sair/i }));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/auth');
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import RegisterPage from '../page';
import * as authAPI from '@/lib/api/auth';
import * as greenhouseAPI from '@/lib/api/greenhouse';
import * as tokenUtils from '@/lib/utils/token';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('next-auth/react');
jest.mock('@/lib/api/auth');
jest.mock('@/lib/api/greenhouse');
jest.mock('@/lib/utils/token');

const mockPush = jest.fn();
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockRegisterUser = authAPI.registerUser as jest.MockedFunction<typeof authAPI.registerUser>;
const mockCreateGreenhouse = greenhouseAPI.createGreenhouse as jest.MockedFunction<typeof greenhouseAPI.createGreenhouse>;
const mockStoreToken = tokenUtils.storeToken as jest.MockedFunction<typeof tokenUtils.storeToken>;

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    // Mock successful signIn by default
    mockSignIn.mockResolvedValue({ ok: true, error: null, status: 200, url: null });
  });

  it('should render account creation form initially', () => {
    render(<RegisterPage />);
    
    expect(screen.getByText('👻 JOIN THE HAUNTED GREENHOUSE 👻')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should handle successful account creation and move to greenhouse setup', async () => {
    const mockResponse = {
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      accessToken: 'mock-token'
    };
    
    mockRegisterUser.mockResolvedValue(mockResponse);
    
    render(<RegisterPage />);
    
    // Fill out account creation form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create spectral account/i }));
    
    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockStoreToken).toHaveBeenCalledWith('mock-token');
      // Updated: Now uses accessToken and isRegistration flag
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        accessToken: 'mock-token',
        isRegistration: 'true',
        redirect: false,
      });
    });
    
    // Should show greenhouse setup form
    await waitFor(() => {
      expect(screen.getByText('🏚️ CONFIGURE YOUR HAUNTED GREENHOUSE 🏚️')).toBeInTheDocument();
    });
  });

  it('should handle registration API errors', async () => {
    const mockError = {
      statusCode: 409,
      message: 'Username already exists'
    };
    
    mockRegisterUser.mockRejectedValue(mockError);
    
    render(<RegisterPage />);
    
    // Fill out and submit form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create spectral account/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('should handle successful greenhouse setup and redirect to dashboard', async () => {
    const mockAuthResponse = {
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      accessToken: 'mock-token'
    };
    
    const mockGreenhouseResponse = {
      id: '1',
      userId: '1',
      name: 'Test Greenhouse',
      location: 'Test Location',
      zones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockRegisterUser.mockResolvedValue(mockAuthResponse);
    mockCreateGreenhouse.mockResolvedValue(mockGreenhouseResponse);
    
    const { container } = render(<RegisterPage />);
    
    // Complete account creation
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create spectral account/i }));
    
    // Wait for greenhouse setup form
    await waitFor(() => {
      expect(screen.getByText('🏚️ CONFIGURE YOUR HAUNTED GREENHOUSE 🏚️')).toBeInTheDocument();
    });
    
    // Fill out greenhouse setup
    fireEvent.change(screen.getByLabelText(/greenhouse name/i), { target: { value: 'Test Greenhouse' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Test Location' } });
    
    // Find and submit the form directly
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockCreateGreenhouse).toHaveBeenCalledWith({
        name: 'Test Greenhouse',
        location: 'Test Location',
        description: undefined,
        zones: []
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should handle skip greenhouse setup', async () => {
    const mockAuthResponse = {
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      accessToken: 'mock-token'
    };
    
    mockRegisterUser.mockResolvedValue(mockAuthResponse);
    
    render(<RegisterPage />);
    
    // Complete account creation
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create spectral account/i }));
    
    // Wait for greenhouse setup form
    await waitFor(() => {
      expect(screen.getByText('🏚️ CONFIGURE YOUR HAUNTED GREENHOUSE 🏚️')).toBeInTheDocument();
    });
    
    // Click skip button
    fireEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AccountCreationForm } from '../AccountCreationForm';
import type { AccountData } from '@/app/(auth)/register/page';

// Mock the UI components to avoid complex dependencies
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, disabled, type, className, ...props }: any) => (
    <button type={type} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/Input', () => ({
  Input: ({ label, error, icon, value, onChange, onBlur, type, placeholder, required, disabled, ...props }: any) => (
    <div>
      {label && <label htmlFor={label}>{label}</label>}
      <input
        id={label}
        type={type}
        value={value || ''}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        {...props}
      />
      {error && <span role="alert" data-testid={`${label}-error`}>{error}</span>}
    </div>
  )
}));

jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  )
}));

describe('AccountCreationForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all required fields', () => {
    render(<AccountCreationForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('validates required fields on form submission', async () => {
    render(<AccountCreationForm {...defaultProps} />);
    
    const form = screen.getByRole('button').closest('form');
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<AccountCreationForm {...defaultProps} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    render(<AccountCreationForm {...defaultProps} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '1234567' } }); // 7 characters
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    render(<AccountCreationForm {...defaultProps} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('displays API error when provided', () => {
    render(<AccountCreationForm {...defaultProps} error="Registration failed" />);
    
    expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(<AccountCreationForm {...defaultProps} isLoading={true} />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button');
    
    expect(usernameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
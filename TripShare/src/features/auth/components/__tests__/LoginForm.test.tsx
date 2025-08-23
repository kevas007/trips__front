import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginForm } from '../LoginForm';
import { useAuthStore } from '../../../../store';

// Mock du store
jest.mock('../../../../store', () => ({
  useAuthStore: jest.fn(),
}));

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();
  
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError,
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      setUser: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginForm />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Mot de passe')).toBeTruthy();
    expect(getByText('Connexion')).toBeTruthy();
    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('handles input changes', () => {
    const { getByPlaceholderText } = render(<LoginForm />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Mot de passe');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('calls login function when form is submitted', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginForm />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Mot de passe');
    const submitButton = getByText('Se connecter');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message when error exists', () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials',
      clearError: mockClearError,
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      setUser: jest.fn(),
    });

    const { getByText } = render(<LoginForm />);
    
    expect(getByText('Invalid credentials')).toBeTruthy();
  });

  it('shows loading state when isLoading is true', () => {
    mockUseAuthStore.mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError,
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      setUser: jest.fn(),
    });

    const { getByText } = render(<LoginForm />);
    
    expect(getByText('Connexion...')).toBeTruthy();
  });

  it('calls onSuccess callback when login is successful', async () => {
    const onSuccess = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <LoginForm onSuccess={onSuccess} />
    );
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Mot de passe');
    const submitButton = getByText('Se connecter');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('shows register link when onSwitchToRegister is provided', () => {
    const onSwitchToRegister = jest.fn();
    const { getByText } = render(
      <LoginForm onSwitchToRegister={onSwitchToRegister} />
    );
    
    expect(getByText("Pas encore de compte ? S'inscrire")).toBeTruthy();
  });

  it('calls onSwitchToRegister when register link is pressed', () => {
    const onSwitchToRegister = jest.fn();
    const { getByText } = render(
      <LoginForm onSwitchToRegister={onSwitchToRegister} />
    );
    
    const registerLink = getByText("Pas encore de compte ? S'inscrire");
    fireEvent.press(registerLink);
    
    expect(onSwitchToRegister).toHaveBeenCalled();
  });
});

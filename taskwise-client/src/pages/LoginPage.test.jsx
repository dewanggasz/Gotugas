import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import LoginPage from './LoginPage';
import * as api from '../services/api'; // Import semua dari api.js

// Mock modul api
vi.mock('../services/api');

describe('LoginPage', () => {
  it('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls onLoginSuccess on successful login', async () => {
    const onLoginSuccessMock = vi.fn();
    const fakeToken = 'fake-jwt-token';
    
    // Atur mock untuk mengembalikan data yang berhasil
    api.login.mockResolvedValue({ data: { token: fakeToken } });

    render(<LoginPage onLoginSuccess={onLoginSuccessMock} />);

    // Simulasi input pengguna
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Simulasi klik tombol
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    // Tunggu dan verifikasi
    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(onLoginSuccessMock).toHaveBeenCalledWith(fakeToken);
    });
  });
});

import React, { useState } from 'react';
import { logInCustomer, signUpCustomer } from '../api';

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = mode === 'login'
        ? await logInCustomer({ phone_number, password })
        : await signUpCustomer({ name, phone_number, password });
      localStorage.setItem('illuma_token', result.token);
      localStorage.setItem('illuma_user', JSON.stringify(result.user));
      onAuthenticated(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <span className="auth-brand">Illuma</span>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p>Discover local shops, their products, updates, and messages in one place.</p>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label>Name<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          )}
          <label>Phone number<input required type="tel" value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} autoComplete="tel" /></label>
          <label>Password<input required type="password" minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-btn" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        </form>
        <button className="text-btn" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
          {mode === 'login' ? 'New to Illuma? Create an account' : 'Already have an account? Log in'}
        </button>
      </section>
    </main>
  );
}

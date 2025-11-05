'use client';
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';

  async function handleLogin() {
    try {
      const res = await fetch(`${gatewayURL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const payload = await res.json().catch(async () => ({ message: await res.text() }));

      if (!res.ok) {
        setMsg(`Error: ${payload.message ?? 'request failed'}`);
        return;
      }

      setMsg(payload.message ?? 'login success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'request failed';
      setMsg(`Error: ${message}`);
    }
  }

  return (
    <main className="p-6">
      <h1>Next + Nest + Go + Turbo 🚀</h1>
      <input
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 mr-2"
      />
      <input
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className="border p-2 mr-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
      <p className="mt-4">{msg}</p>
    </main>
  );
}

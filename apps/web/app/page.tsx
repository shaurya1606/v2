'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/ping')
      .then((res) => res.text())
      .then((data) => setMsg(data))
      .catch(console.error);
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Next.js + Go Integration</h1>
      <p>Response from Go backend: {msg || 'Loading...'}</p>
    </main>
  );
}

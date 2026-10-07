import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
  const nav = useNavigate();
  const [u, setU] = useState('admin');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const r = await api('/auth/login', { method: 'POST', body: { username: u, password: p } });
      localStorage.setItem('token', r.token);
      localStorage.setItem('name', r.name);
      nav('/');
    } catch (x: any) { setErr(x.message); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-800">Masuk MRP ERP</h1>
        {err && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{err}</p>}
        <input className="inp" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
        <input className="inp" type="password" placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} />
        <button className="btn w-full">Login</button>
        <p className="text-center text-xs text-slate-400">Default: admin / admin123</p>
      </form>
    </div>
  );
}

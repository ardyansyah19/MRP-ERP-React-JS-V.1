import { useEffect, useState, FormEvent } from 'react';
import { api } from '../api';

export type Field = { key: string; label: string; type: 'text' | 'number' | 'date' | 'select' | 'ref' | 'lines'; options?: string[] };
type Props = { title: string; path: string; fields: Field[] };

export default function Crud({ title, path, fields }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any | null>(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  const load = async () => {
    try { setRows(await api(`/${path}`)); setItems(await api('/items')); } catch (e: any) { setErr(e.message); }
  };
  useEffect(() => { load(); }, [path]);

  const label = (id: number) => { const i = items.find((x) => x.id === id); return i ? `${i.code} - ${i.name}` : '-'; };
  const cell = (r: any, f: Field) =>
    f.type === 'ref' ? label(r[f.key]) : f.type === 'lines' ? (r.lines || []).map((l: any) => `${label(l.itemId)} ×${l.qty}`).join(', ') : r[f.key] ?? '-';
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    const body = { ...form };
    fields.forEach((f) => { if (f.type === 'number' || f.type === 'ref') body[f.key] = Number(body[f.key] || 0); });
    if (body.lines) body.lines = body.lines.map((l: any) => ({ itemId: Number(l.itemId), qty: Number(l.qty) }));
    try {
      await api(`/${path}${form.id ? '/' + form.id : ''}`, { method: form.id ? 'PUT' : 'POST', body });
      setForm(null);
      load();
    } catch (x: any) { setErr(x.message); }
  };
  const del = async (id: number) => {
    if (!confirm('Hapus data ini?')) return;
    try { await api(`/${path}/${id}`, { method: 'DELETE' }); setErr(''); load(); } catch (x: any) { setErr(x.message); }
  };
  const shown = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <div className="flex gap-2">
          <input className="inp !w-56" placeholder="Cari..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn" onClick={() => { setErr(''); setForm(path === 'orders' ? { status: 'Rencana', qty: 1 } : { lines: [] }); }}>+ Tambah</button>
        </div>
      </div>
      {err && !form && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{err}</p>}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500"><tr>{fields.map((f) => <th key={f.key} className="p-3">{f.label}</th>)}<th className="p-3">Aksi</th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                {fields.map((f) => <td key={f.key} className="p-3">{cell(r, f)}</td>)}
                <td className="space-x-2 whitespace-nowrap p-3">
                  <button className="btn-o" onClick={() => { setErr(''); setForm({ ...r }); }}>Edit</button>
                  <button className="btn-o !text-red-600" onClick={() => del(r.id)}>Hapus</button>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={fields.length + 1} className="p-6 text-center text-slate-400">Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold">{form.id ? 'Edit' : 'Tambah'} {title}</h3>
            {err && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{err}</p>}
            {fields.map((f) => (
              <label key={f.key} className="block text-sm">
                <span className="mb-1 block text-slate-600">{f.label}</span>
                {f.type === 'select' ? (
                  <select className="inp" value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                    <option value="">-- pilih --</option>{f.options!.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === 'ref' ? (
                  <select className="inp" value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                    <option value="">-- pilih --</option>{items.map((i) => <option key={i.id} value={i.id}>{i.code} - {i.name}</option>)}
                  </select>
                ) : f.type === 'lines' ? (
                  <div className="space-y-2">
                    {(form.lines || []).map((l: any, i: number) => (
                      <div key={i} className="flex gap-2">
                        <select className="inp" value={l.itemId ?? ''} onChange={(e) => set('lines', form.lines.map((x: any, j: number) => (j === i ? { ...x, itemId: e.target.value } : x)))}>
                          <option value="">-- komponen --</option>{items.map((it) => <option key={it.id} value={it.id}>{it.code} - {it.name}</option>)}
                        </select>
                        <input className="inp !w-24" type="number" min="0" step="any" value={l.qty} onChange={(e) => set('lines', form.lines.map((x: any, j: number) => (j === i ? { ...x, qty: e.target.value } : x)))} />
                        <button type="button" className="btn-o" onClick={() => set('lines', form.lines.filter((_: any, j: number) => j !== i))}>✕</button>
                      </div>
                    ))}
                    <button type="button" className="btn-o" onClick={() => set('lines', [...(form.lines || []), { itemId: '', qty: 1 }])}>+ Komponen</button>
                  </div>
                ) : (
                  <input className="inp" type={f.type} min={f.type === 'number' ? 0 : undefined} step="any" value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-o" onClick={() => setForm(null)}>Batal</button>
              <button className="btn">Simpan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

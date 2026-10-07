import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([api('/items'), api('/boms'), api('/orders'), api('/mrp')])
      .then(([items, boms, orders, mrp]) => setD({ items, boms, orders, mrp }))
      .catch((e) => setErr(e.message));
  }, []);
  if (err) return <p className="text-red-600">{err}</p>;
  if (!d) return <p>Memuat...</p>;
  const open = d.orders.filter((o: any) => o.status !== 'Selesai').length;
  const cards = [['Barang', d.items.length], ['BOM', d.boms.length], ['Order Aktif', open], ['Bahan Kurang', d.mrp.filter((m: any) => m.shortage > 0).length]];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{l}</p><p className="text-3xl font-bold text-indigo-600">{v}</p></div>
        ))}
      </div>
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-3 font-semibold text-slate-800">Perencanaan Kebutuhan Material (MRP)</h3>
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500"><tr>{['Kode', 'Material', 'Kebutuhan', 'Stok', 'Kekurangan'].map((h) => <th key={h} className="py-2">{h}</th>)}</tr></thead>
          <tbody>
            {d.mrp.map((m: any) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="py-2">{m.code}</td><td>{m.name}</td><td>{m.required} {m.unit}</td><td>{m.stock}</td>
                <td className={m.shortage > 0 ? 'font-semibold text-red-600' : 'text-green-600'}>{m.shortage > 0 ? `Beli ${m.shortage} ${m.unit}` : 'Aman'}</td>
              </tr>
            ))}
            {!d.mrp.length && <tr><td colSpan={5} className="py-4 text-center text-slate-400">Belum ada order aktif dengan BOM</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

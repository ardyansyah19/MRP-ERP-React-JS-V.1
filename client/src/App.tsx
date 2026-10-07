import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Items, Boms, Orders } from './pages/Masters';

const menu = [
  ['/', 'Dashboard & MRP'],
  ['/items', 'Master Barang'],
  ['/boms', 'BOM'],
  ['/orders', 'Order Produksi'],
];

function Layout() {
  const nav = useNavigate();
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-56 shrink-0 bg-slate-900 p-4 text-slate-200">
        <h1 className="mb-6 text-xl font-bold text-white">MRP ERP</h1>
        <nav className="space-y-1">
          {menu.map(([to, label]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="mt-8 text-sm text-slate-400 hover:text-white" onClick={() => { localStorage.clear(); nav('/login'); }}>
          Keluar ({localStorage.getItem('name')})
        </button>
      </aside>
      <main className="flex-1 overflow-x-auto p-6"><Outlet /></main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/items" element={<Items />} />
          <Route path="/boms" element={<Boms />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

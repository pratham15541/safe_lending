import { NavLink, Outlet } from "react-router-dom";

const navItemClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm ${isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800"}`;

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Safe Lending Monitoring Dashboard
          </h1>
          <nav className="flex gap-2">
            <NavLink to="/" className={navItemClass} end>
              Overview
            </NavLink>
            <NavLink to="/analysis" className={navItemClass}>
              Full Analysis
            </NavLink>
            <NavLink to="/monitoring" className={navItemClass}>
              Monitoring
            </NavLink>
            <NavLink to="/inference" className={navItemClass}>
              Inference
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

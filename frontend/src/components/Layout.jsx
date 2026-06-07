import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Layout() {
  const { user, logout } = useAuthStore();

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-accent/20 text-accent" : "text-muted hover:text-white"
    }`;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-elevated/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg tracking-tight">Study Tracker</span>
            <div className="flex gap-1">
              <NavLink to="/" className={linkClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/stats" className={linkClass}>
                Stats
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted font-mono">@{user?.username}</span>
            <button
              onClick={logout}
              className="text-muted hover:text-danger transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

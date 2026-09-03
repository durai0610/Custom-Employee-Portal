import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

// The actual list of nav links, shared by both the desktop sidebar and the
// mobile drawer so there is exactly one place that defines "what shows up
// in navigation" — same RBAC gating (hasRole('Admin')) applies either way.
// `onNavigate` is called after a link is clicked so the mobile drawer can
// close itself; it's a no-op on desktop.
function NavLinks({ onNavigate = () => {} }) {
  const { hasRole } = useAuth();

  return (
    <nav className="flex flex-col gap-1">
      <NavLink to="/dashboard" className={linkClass} end onClick={onNavigate}>
        Dashboard
      </NavLink>

      {hasRole('Admin') && (
        <>
          <p className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</p>
          <NavLink to="/admin/users" className={linkClass} onClick={onNavigate}>
            Users
          </NavLink>
          <NavLink to="/admin/roles" className={linkClass} onClick={onNavigate}>
            Roles
          </NavLink>
          <NavLink to="/admin/permissions" className={linkClass} onClick={onNavigate}>
            Permissions
          </NavLink>
          <NavLink to="/admin/audit-logs" className={linkClass} onClick={onNavigate}>
            Audit Logs
          </NavLink>
        </>
      )}
    </nav>
  );
}

/**
 * Renders:
 * - the existing desktop sidebar, unchanged (`hidden ... sm:block`)
 * - a mobile-only slide-in drawer + backdrop, shown when `mobileOpen` is
 *   true. The drawer is only ever rendered below the `sm` breakpoint
 *   (`sm:hidden`), so it never appears alongside the desktop sidebar.
 *
 * `mobileOpen` / `onMobileClose` are owned by AppLayout so the hamburger
 * button in Navbar (a sibling component) can control this drawer.
 */
export default function Sidebar({ mobileOpen = false, onMobileClose = () => {} }) {
  return (
    <>
      {/* Desktop sidebar — unchanged from before */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 sm:block">
        <NavLinks />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          {/* Backdrop — clicking it closes the menu */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onMobileClose}
            className="absolute inset-0 h-full w-full bg-slate-900/40"
          />

          {/* Slide-in panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white p-4 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                  EP
                </div>
                <span className="text-sm font-semibold text-slate-800">Employee Portal</span>
              </div>
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <NavLinks onNavigate={onMobileClose} />
          </div>
        </div>
      )}
    </>
  );
}

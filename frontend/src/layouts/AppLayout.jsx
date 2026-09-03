import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Belt-and-suspenders close: NavLink clicks already close the drawer
  // (see Sidebar's onNavigate), but this also covers browser back/forward
  // and any other route change that isn't a direct link click.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <div className="flex flex-1">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        {/* min-w-0 is required here: without it, a flex child won't shrink
            below its content's intrinsic width, so a wide table further
            down the tree (e.g. the admin tables' overflow-x-auto wrappers)
            would stretch <main> — and the whole page — wider than the
            viewport instead of scrolling internally. */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

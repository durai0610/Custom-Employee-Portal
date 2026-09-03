import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Frontend-side convenience only — hides UI the user shouldn't see and
 * saves a round trip. It is NOT the security boundary: every API this
 * page calls independently re-checks the user's role/permissions on the
 * backend and returns 403 if they don't match, regardless of what this
 * component allowed to render.
 */
export default function RoleGuard({ roles = [] }) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

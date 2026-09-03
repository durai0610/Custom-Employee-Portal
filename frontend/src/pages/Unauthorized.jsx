import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100 text-2xl">🚫</div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Your account doesn't have permission to view this page. If you believe this is a mistake, contact an
        administrator.
      </p>
      <Link to="/dashboard" className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
        Back to dashboard
      </Link>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { appsApi, zohoApi } from '../services/endpoints';
import ApplicationCard from '../components/ApplicationCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Badge from '../components/Badge.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [apps, setApps] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  const loadApps = async () => {
    setStatus('loading');
    try {
      const { data } = await appsApi.getMyApps();
      setApps(data.apps);
      setDemoMode(data.demoMode);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
    }
  };

  useEffect(() => {
    loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calls the backend proxy for the chosen app. The backend re-verifies
  // authorization on this exact request — this click is not itself the
  // security check, just a convenience trigger.
  const handleOpen = async (app) => {
    try {
      const proxyCall = { people: zohoApi.people, crm: zohoApi.crm, desk: zohoApi.desk, books: zohoApi.books }[app.key];
      await proxyCall();
      showToast(`Connected to ${app.name}${demoMode ? ' (demo data)' : ''}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || `Could not reach ${app.name}`, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {user?.roles?.map((r) => (
            <Badge key={r} variant="brand">
              {r}
            </Badge>
          ))}
          {demoMode && <Badge variant="neutral">Zoho: Demo mode</Badge>}
        </div>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Your Zoho applications</h2>

      {status === 'loading' && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {status === 'error' && <ErrorMessage message="Could not load your applications." onRetry={loadApps} />}

      {status === 'ready' && apps.length === 0 && (
        <EmptyState title="No applications assigned" description="Ask an administrator to assign you a role." />
      )}

      {status === 'ready' && apps.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <ApplicationCard key={app.key} app={app} onOpen={handleOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

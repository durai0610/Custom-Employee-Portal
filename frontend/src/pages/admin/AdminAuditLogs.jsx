import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/endpoints';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Badge from '../../components/Badge.jsx';

const ACTION_VARIANT = (action) => {
  if (action.includes('FAILED') || action.includes('DENIED') || action.includes('UNAUTHORIZED')) return 'danger';
  if (action.includes('SUCCESS') || action.includes('CREATED')) return 'success';
  return 'neutral';
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState('');
  const [status, setStatus] = useState('loading');

  const load = async (page = 1) => {
    setStatus('loading');
    try {
      const { data } = await adminApi.listAuditLogs({
        page,
        pageSize: 20,
        ...(actionFilter ? { action: actionFilter } : {}),
      });
      setLogs(data.logs);
      setPagination(data.pagination);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
        <input
          placeholder="Filter by action (e.g. LOGIN_FAILED)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {status === 'loading' && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {status === 'error' && <ErrorMessage message="Could not load audit logs." onRetry={() => load(pagination.page)} />}
      {status === 'ready' && logs.length === 0 && <EmptyState title="No matching audit log entries" />}

      {status === 'ready' && logs.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{log.user ? log.user.email : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ACTION_VARIANT(log.action)}>{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.resource || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => load(pagination.page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => load(pagination.page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

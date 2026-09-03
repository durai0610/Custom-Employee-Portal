import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';

export default function AdminPermissions() {
  const { showToast } = useToast();
  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [form, setForm] = useState({ name: '', description: '' });

  const load = async () => {
    setStatus('loading');
    try {
      const { data } = await adminApi.listPermissions();
      setPermissions(data.permissions);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createPermission(form);
      showToast('Permission created', 'success');
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not create permission', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Permissions</h1>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            required
            placeholder="e.g. zoho.crm.access"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Add
        </button>
      </form>

      {status === 'loading' && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {status === 'error' && <ErrorMessage message="Could not load permissions." onRetry={load} />}

      {status === 'ready' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

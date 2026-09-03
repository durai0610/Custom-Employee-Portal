import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ErrorMessage from '../../components/ErrorMessage.jsx';
import Badge from '../../components/Badge.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

const emptyForm = { name: '', description: '', permissionIds: [] };

export default function AdminRoles() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState('loading');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setStatus('loading');
    try {
      const [rolesRes, permsRes] = await Promise.all([adminApi.listRoles(), adminApi.listPermissions()]);
      setRoles(rolesRes.data.roles);
      setPermissions(permsRes.data.permissions);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingRole(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description || '', permissionIds: role.permissions.map((p) => p.id) });
    setShowForm(true);
  };

  const togglePermission = (id) => {
    setForm((f) => ({
      ...f,
      permissionIds: f.permissionIds.includes(id) ? f.permissionIds.filter((p) => p !== id) : [...f.permissionIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await adminApi.updateRole(editingRole.id, form);
        showToast('Role updated', 'success');
      } else {
        await adminApi.createRole(form);
        showToast('Role created', 'success');
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not save role', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await adminApi.deleteRole(pendingDelete.id);
      showToast('Role deleted', 'success');
      setPendingDelete(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not delete role', 'error');
      setPendingDelete(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Roles</h1>
        <button onClick={openCreate} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + New role
        </button>
      </div>

      {status === 'loading' && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}
      {status === 'error' && <ErrorMessage message="Could not load roles." onRetry={load} />}

      {status === 'ready' && (
        <div className="space-y-3">
          {roles.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{r.name}</h3>
                  {r.description && <p className="mt-0.5 text-xs text-slate-500">{r.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {r.permissions.map((p) => (
                      <Badge key={p.id}>{p.name}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 text-sm">
                  <button onClick={() => openEdit(r)} className="text-brand-600 hover:underline">
                    Edit
                  </button>
                  {r.name !== 'Admin' && (
                    <button onClick={() => setPendingDelete(r)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-slate-900">{editingRole ? 'Edit role' : 'New role'}</h2>

            <label className="mt-4 block text-sm font-medium text-slate-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <label className="mt-3 block text-sm font-medium text-slate-700">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <p className="mt-4 mb-2 text-sm font-medium text-slate-700">Permissions</p>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
              {permissions.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => togglePermission(p.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    form.permissionIds.includes(p.id) ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete role "${pendingDelete?.name}"?`}
        description="Roles still assigned to users cannot be deleted."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

import React from 'react';

const APP_STYLES = {
  people: { emoji: '🧑\u200d💼', color: 'from-sky-500 to-sky-600' },
  crm: { emoji: '📈', color: 'from-emerald-500 to-emerald-600' },
  desk: { emoji: '🎧', color: 'from-amber-500 to-amber-600' },
  books: { emoji: '💰', color: 'from-violet-500 to-violet-600' },
};

export default function ApplicationCard({ app, onOpen }) {
  const style = APP_STYLES[app.key] || { emoji: '🔗', color: 'from-slate-500 to-slate-600' };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div>
        <div className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br text-lg text-white ${style.color}`}>
          {style.emoji}
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">{app.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{app.description}</p>
      </div>
      <button
        onClick={() => onOpen(app)}
        className="mt-5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Open {app.name}
      </button>
    </div>
  );
}

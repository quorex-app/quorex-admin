import { useEffect, useState, useCallback } from 'react';
import { Edit2, Check, AlertCircle, Zap, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const SEVERITY_COLORS = {
  1: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Critique' },
  2: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Important' },
  3: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', label: 'Psychologique' },
};

const PHASE_COLORS = {
  blue: { tab: 'bg-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', accent: 'text-blue-700' },
  indigo: { tab: 'bg-indigo-600', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700', accent: 'text-indigo-700' },
  green: { tab: 'bg-green-600', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700', accent: 'text-green-700' },
  purple: { tab: 'bg-purple-600', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700', accent: 'text-purple-700' },
};

function InlineEdit({ value, onSave, multiline = false, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editValue);
      setEditing(false);
      addToast('Saved', 'success');
    } catch {
      addToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className={`group relative cursor-text ${className}`} onClick={() => setEditing(true)}>
        {value}
        <Edit2 size={11} className="absolute top-0 right-0 text-transparent group-hover:text-gray-400 transition-colors" />
      </div>
    );
  }

  return (
    <div>
      {multiline ? (
        <textarea
          autoFocus
          className="w-full border border-indigo-400 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          rows={Math.max(3, editValue.split('\n').length + 1)}
        />
      ) : (
        <input
          autoFocus
          className="w-full border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
        />
      )}
      <div className="flex gap-2 mt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded disabled:opacity-50"
        >
          <Check size={11} /> Save
        </button>
        <button
          onClick={() => { setEditValue(value); setEditing(false); }}
          className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Scale() {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(0);
  const { user } = useAuth();
  const { addToast } = useToast();
  const isSuperadmin = user?.role === 'superadmin';

  const fetchScale = useCallback(async () => {
    try {
      const res = await api.get('/scale');
      setPhases(res.data);
    } catch {
      addToast('Failed to load scale plan', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchScale(); }, [fetchScale]);

  const handleSavePhase = async (id, data) => {
    const res = await api.patch(`/scale/phases/${id}`, data);
    setPhases(prev => prev.map(p => p.id === id ? { ...p, ...res.data } : p));
  };

  const handleSaveAction = async (id, data) => {
    const res = await api.patch(`/scale/actions/${id}`, data);
    setPhases(prev => prev.map(p => ({
      ...p,
      actions: p.actions.map(a => a.id === id ? res.data : a),
    })));
  };

  const handleSaveBlocker = async (id, data) => {
    const res = await api.patch(`/scale/blockers/${id}`, data);
    setPhases(prev => prev.map(p => ({
      ...p,
      blockers: p.blockers.map(b => b.id === id ? res.data : b),
    })));
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </Layout>
    );
  }

  if (!phases.length) return (
    <Layout>
      <div className="text-gray-500 text-sm">No scale data found.</div>
    </Layout>
  );

  const phase = phases[activePhase];
  const colors = PHASE_COLORS[phase.badge_color] || PHASE_COLORS.blue;

  return (
    <Layout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Scale Plan</h1>
          <p className="text-gray-500 text-sm mt-1">90-day roadmap to $5K MRR</p>
        </div>

        {/* Phase tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {phases.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activePhase === i
                  ? `${PHASE_COLORS[p.badge_color]?.tab || 'bg-blue-600'} text-white`
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Phase {p.phase_number} — {p.title}
            </button>
          ))}
        </div>

        {/* Phase header */}
        <div className={`rounded-xl border p-5 mb-6 ${colors.bg} border-gray-200`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${colors.badge}`}>
                  Phase {phase.phase_number}
                </span>
                <span className="text-xs text-gray-500 font-medium">{phase.period}</span>
              </div>
              {isSuperadmin ? (
                <InlineEdit
                  value={phase.title}
                  onSave={(title) => handleSavePhase(phase.id, { title })}
                  className={`text-xl font-bold ${colors.accent}`}
                />
              ) : (
                <h2 className={`text-xl font-bold ${colors.accent}`}>{phase.title}</h2>
              )}
              {isSuperadmin ? (
                <InlineEdit
                  value={phase.subtitle || ''}
                  onSave={(subtitle) => handleSavePhase(phase.id, { subtitle })}
                  className="text-sm text-gray-600 mt-0.5"
                />
              ) : (
                <p className="text-sm text-gray-600 mt-0.5">{phase.subtitle}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">MRR Target</p>
              {isSuperadmin ? (
                <InlineEdit
                  value={phase.mrr_target}
                  onSave={(mrr_target) => handleSavePhase(phase.id, { mrr_target })}
                  className="text-lg font-bold text-gray-900"
                />
              ) : (
                <p className="text-lg font-bold text-gray-900">{phase.mrr_target}</p>
              )}
            </div>
          </div>

          {/* KPI card */}
          <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">KPI Principal</span>
            </div>
            {isSuperadmin ? (
              <InlineEdit
                value={phase.kpi_label}
                onSave={(kpi_label) => handleSavePhase(phase.id, { kpi_label })}
                className="text-base font-bold text-gray-900 mb-1"
              />
            ) : (
              <p className="text-base font-bold text-gray-900 mb-1">{phase.kpi_label}</p>
            )}
            {isSuperadmin ? (
              <InlineEdit
                value={phase.kpi_description || ''}
                onSave={(kpi_description) => handleSavePhase(phase.id, { kpi_description })}
                multiline
                className="text-sm text-gray-600"
              />
            ) : (
              <p className="text-sm text-gray-600">{phase.kpi_description}</p>
            )}
          </div>
        </div>

        {/* Actions grid */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Zap size={15} className="text-indigo-500" />
            Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {phase.actions.map(action => (
              <div key={action.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colors.badge}`}>
                    {action.week_label}
                  </span>
                </div>
                {isSuperadmin ? (
                  <InlineEdit
                    value={action.title}
                    onSave={(title) => handleSaveAction(action.id, { title })}
                    className="text-sm font-semibold text-gray-900 mb-1"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 mb-1">{action.title}</p>
                )}
                {isSuperadmin ? (
                  <InlineEdit
                    value={action.body || ''}
                    onSave={(body) => handleSaveAction(action.id, { body })}
                    multiline
                    className="text-sm text-gray-500 leading-relaxed"
                  />
                ) : (
                  <p className="text-sm text-gray-500 leading-relaxed">{action.body}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blockers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle size={15} className="text-red-500" />
            Blockers à éviter
          </h3>
          <div className="space-y-3">
            {phase.blockers.map(blocker => {
              const sev = SEVERITY_COLORS[blocker.severity] || SEVERITY_COLORS[1];
              return (
                <div key={blocker.id} className={`rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${sev.dot}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isSuperadmin ? (
                          <InlineEdit
                            value={blocker.title}
                            onSave={(title) => handleSaveBlocker(blocker.id, { title })}
                            className="text-sm font-semibold text-gray-900"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">{blocker.title}</p>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sev.badge}`}>
                          {sev.label}
                        </span>
                      </div>
                      {isSuperadmin ? (
                        <InlineEdit
                          value={blocker.description || ''}
                          onSave={(description) => handleSaveBlocker(blocker.id, { description })}
                          multiline
                          className="text-sm text-gray-600 mb-2"
                        />
                      ) : (
                        <p className="text-sm text-gray-600 mb-2">{blocker.description}</p>
                      )}
                      <div className="bg-white/70 rounded-lg p-2.5 border border-white">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Fix →</p>
                        {isSuperadmin ? (
                          <InlineEdit
                            value={blocker.fix_text || ''}
                            onSave={(fix_text) => handleSaveBlocker(blocker.id, { fix_text })}
                            multiline
                            className="text-sm text-gray-700"
                          />
                        ) : (
                          <p className="text-sm text-gray-700">{blocker.fix_text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

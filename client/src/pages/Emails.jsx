import { useEffect, useState, useCallback } from 'react';
import { Copy, Check, Edit2, ChevronRight, AlertCircle, X } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const EMAIL_TIMING = {
  1: 'Jour J (premier contact)',
  2: 'J+3 si pas de réponse à E1',
  3: 'J+7 si pas de réponse à E1 et E2',
};

const EMAIL_OBJECTIVE = {
  1: 'Susciter la curiosité, poser une question directe',
  2: 'Apporter la preuve sociale, créer l\'urgence avec les early adopters',
  3: 'Fermer la boucle, ultime CTA ou désengagement propre',
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
        copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

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
      <div className={`group relative ${className}`} onClick={() => setEditing(true)}>
        <div className="cursor-text">{value}</div>
        <Edit2 size={12} className="absolute top-0 right-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    );
  }

  return (
    <div className={className}>
      {multiline ? (
        <textarea
          autoFocus
          className="w-full border border-indigo-400 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none font-mono"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          rows={Math.max(6, editValue.split('\n').length + 1)}
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
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ExpandableCard({ title, children, defaultOpen = false, borderColor = 'border-gray-200' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`border rounded-lg overflow-hidden ${borderColor}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        {title}
        <ChevronRight size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function SubjectOptions({ subjects, emailId, isSuperadmin, onSave }) {
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState('');
  const { addToast } = useToast();

  const handleSave = async (idx) => {
    const updated = [...subjects];
    updated[idx] = editVal;
    try {
      await onSave(JSON.stringify(updated));
      setEditIdx(null);
      addToast('Subject saved', 'success');
    } catch {
      addToast('Failed to save', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {subjects.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 w-5">{String.fromCharCode(65 + i)}</span>
          {editIdx === i ? (
            <div className="flex-1 flex gap-1">
              <input
                autoFocus
                className="flex-1 border border-indigo-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
              />
              <button onClick={() => handleSave(i)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                <Check size={11} />
              </button>
              <button onClick={() => setEditIdx(null)} className="text-xs text-gray-500 px-2 py-1 rounded border border-gray-200">
                <X size={11} />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between group">
              <span className="text-sm text-gray-700">{s}</span>
              {isSuperadmin && (
                <button
                  onClick={() => { setEditIdx(i); setEditVal(s); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Edit2 size={12} />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Emails() {
  const [templates, setTemplates] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const { addToast } = useToast();
  const isSuperadmin = user?.role === 'superadmin';

  const fetchEmails = useCallback(async () => {
    try {
      const res = await api.get('/emails');
      setTemplates(res.data.templates);
      setRules(res.data.rules);
    } catch {
      addToast('Failed to load emails', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchEmails(); }, [fetchEmails]);

  const handleSaveBody = async (id, body) => {
    const res = await api.patch(`/emails/${id}`, { body });
    setTemplates(prev => prev.map(t => t.id === id ? res.data : t));
  };

  const handleSaveSubject = async (id, subject) => {
    const res = await api.patch(`/emails/${id}`, { subject });
    setTemplates(prev => prev.map(t => t.id === id ? res.data : t));
  };

  const handleSaveRule = async (id, content) => {
    const res = await api.patch(`/emails/rules/${id}`, { content });
    setRules(prev => prev.map(r => r.id === id ? res.data : r));
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </Layout>
    );
  }

  const absoluteRule = rules.find(r => r.type === 'absolute_rule');
  const personalizationRules = rules.filter(r => r.type === 'personalization_rule').sort((a, b) => a.position - b.position);
  const sendingRules = rules.filter(r => r.type === 'sending_rule').sort((a, b) => a.position - b.position);

  const activeTemplate = templates[activeTab];
  if (!activeTemplate) return null;

  let subjects = [];
  try { subjects = JSON.parse(activeTemplate.subject); } catch { subjects = [activeTemplate.subject]; }

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Email Sequences</h1>
          <p className="text-gray-500 text-sm mt-1">Cold email sequence for Quorex presell</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {templates.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === i
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Email {t.email_number}
            </button>
          ))}
        </div>

        {/* Header info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{activeTemplate.name}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                <span><span className="font-medium text-gray-700">Timing :</span> {EMAIL_TIMING[activeTemplate.email_number]}</span>
                <span><span className="font-medium text-gray-700">Objectif :</span> {EMAIL_OBJECTIVE[activeTemplate.email_number]}</span>
              </div>
            </div>
          </div>

          {/* Subject lines */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lignes d'objet</p>
            <SubjectOptions
              subjects={subjects}
              emailId={activeTemplate.id}
              isSuperadmin={isSuperadmin}
              onSave={(subject) => handleSaveSubject(activeTemplate.id, subject)}
            />
          </div>
        </div>

        {/* Email preview */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Aperçu email</span>
            <CopyButton text={activeTemplate.body} />
          </div>
          <div className="p-5">
            {isSuperadmin ? (
              <InlineEdit
                value={activeTemplate.body}
                onSave={(body) => handleSaveBody(activeTemplate.id, body)}
                multiline
                className="font-mono text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
              />
            ) : (
              <pre className="font-mono text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{activeTemplate.body}</pre>
            )}
          </div>
        </div>

        {/* Annotations */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Décryptage & Règles</h3>

          {/* Absolute rule */}
          {absoluteRule && (
            <ExpandableCard title="Règle absolue" borderColor="border-blue-200" defaultOpen>
              <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-r-lg">
                {isSuperadmin ? (
                  <InlineEdit
                    value={absoluteRule.content}
                    onSave={(content) => handleSaveRule(absoluteRule.id, content)}
                    multiline
                    className="text-sm text-blue-900"
                  />
                ) : (
                  <p className="text-sm text-blue-900">{absoluteRule.content}</p>
                )}
              </div>
            </ExpandableCard>
          )}

          {/* Personalization rules */}
          <ExpandableCard title="Règles de personnalisation" borderColor="border-gray-200" defaultOpen>
            <ul className="space-y-2">
              {personalizationRules.map(rule => (
                <li key={rule.id} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 font-bold mt-0.5">→</span>
                  {isSuperadmin ? (
                    <InlineEdit
                      value={rule.content}
                      onSave={(content) => handleSaveRule(rule.id, content)}
                      className="flex-1"
                    />
                  ) : (
                    <span className="flex-1">{rule.content}</span>
                  )}
                </li>
              ))}
            </ul>
          </ExpandableCard>

          {/* Sending rules */}
          <ExpandableCard title="Règles d'envoi" borderColor="border-gray-200">
            <ul className="space-y-2">
              {sendingRules.map(rule => (
                <li key={rule.id} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                  {isSuperadmin ? (
                    <InlineEdit
                      value={rule.content}
                      onSave={(content) => handleSaveRule(rule.id, content)}
                      className="flex-1"
                    />
                  ) : (
                    <span className="flex-1">{rule.content}</span>
                  )}
                </li>
              ))}
            </ul>
          </ExpandableCard>
        </div>
      </div>
    </Layout>
  );
}

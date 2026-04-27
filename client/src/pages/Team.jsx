import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Link, Copy, Check, Trash2, AlertCircle, Shield, User } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function RoleBadge({ role }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
      role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {role === 'superadmin' ? <Shield size={11} /> : <User size={11} />}
      {role === 'superadmin' ? 'Superadmin' : 'Collaborator'}
    </span>
  );
}

function CopyLink({ token }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/invite/${token}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 font-mono truncate max-w-xs">{url}</span>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-medium transition-colors ${
          copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function Team() {
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const fetchTeam = useCallback(async () => {
    try {
      const res = await api.get('/team');
      setUsers(res.data.users);
      setInvitations(res.data.invitations);
    } catch {
      addToast('Failed to load team', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await api.post('/team/invite', { email: inviteEmail.trim(), role: 'collaborator' });
      setInvitations(prev => [res.data, ...prev]);
      setInviteEmail('');
      setInviteOpen(false);
      addToast('Invitation sent!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send invitation', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRevokeInvitation = async (id) => {
    if (!confirm('Revoke this invitation?')) return;
    try {
      await api.delete(`/team/invitations/${id}`);
      setInvitations(prev => prev.filter(i => i.id !== id));
      addToast('Invitation revoked', 'success');
    } catch {
      addToast('Failed to revoke', 'error');
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user? They will be logged out.')) return;
    try {
      await api.patch(`/team/users/${id}/deactivate`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: 0 } : u));
      addToast('User deactivated', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to deactivate', 'error');
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/team/users/${id}/activate`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: 1 } : u));
      addToast('User reactivated', 'success');
    } catch {
      addToast('Failed to activate', 'error');
    }
  };

  const pendingInvitations = invitations.filter(i => !i.accepted_at);

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team</h1>
            <p className="text-gray-500 text-sm mt-1">Manage users and invitations</p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={16} />
            Invite collaborator
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-16" />
            ))}
          </div>
        ) : (
          <>
            {/* Active users */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-700">Members ({users.length})</h2>
              </div>
              {users.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  No users found
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {users.map(u => (
                    <div key={u.id} className={`flex items-center gap-4 px-5 py-3.5 ${!u.is_active ? 'opacity-50' : ''}`}>
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-600">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{u.name}</span>
                          {!u.is_active && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <RoleBadge role={u.role} />
                      <div className="text-right text-xs text-gray-400 hidden sm:block">
                        <div>Joined {formatDate(u.created_at)}</div>
                        {u.last_login && <div>Last login {formatDate(u.last_login)}</div>}
                      </div>
                      {u.id !== currentUser?.id && u.role !== 'superadmin' && (
                        <button
                          onClick={() => u.is_active ? handleDeactivate(u.id) : handleActivate(u.id)}
                          className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded border border-gray-200 hover:border-red-300 transition-colors"
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending invitations */}
            {pendingInvitations.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-sm font-semibold text-gray-700">Pending Invitations ({pendingInvitations.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingInvitations.map(inv => (
                    <div key={inv.id} className="px-5 py-3.5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Link size={14} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{inv.email}</span>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">En attente</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Invited by {inv.invited_by_name} · Expires {formatDate(inv.expires_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeInvitation(inv.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Revoke"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <CopyLink token={inv.token} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite a collaborator">
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
              Collaborator (read-only except todos)
            </div>
          </div>
          <p className="text-xs text-gray-500">
            An invitation link valid for 7 days will be generated. Share it with the person you want to invite.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {inviting ? 'Generating…' : 'Generate invite link'}
            </button>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

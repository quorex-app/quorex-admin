import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Mail, Users, TrendingUp, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import api from '../api/axios';

function MetricCard({ icon: Icon, label, value, sub, color, to }) {
  return (
    <Link to={to} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs text-indigo-600 font-medium">
        View <ChevronRight size={12} />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of Quorex admin</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={CheckSquare}
              label="Total Todos"
              value={stats?.todos?.total ?? 0}
              sub={`${stats?.todos?.done ?? 0} completed`}
              color="bg-indigo-500"
              to="/todos"
            />
            <MetricCard
              icon={TrendingUp}
              label="Completion"
              value={`${stats?.todos?.percent ?? 0}%`}
              sub="todos done"
              color="bg-green-500"
              to="/todos"
            />
            <MetricCard
              icon={Mail}
              label="Email Templates"
              value={stats?.emails ?? 0}
              sub="sequences"
              color="bg-blue-500"
              to="/emails"
            />
            <MetricCard
              icon={Users}
              label="Team Members"
              value={stats?.team ?? 0}
              sub="active users"
              color="bg-purple-500"
              to="/team"
            />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { to: '/todos', label: 'Manage Todo List', desc: 'Track progress across all phases', icon: CheckSquare },
              { to: '/scale', label: 'Scale Plan', desc: 'View roadmap phases and blockers', icon: TrendingUp },
              { to: '/emails', label: 'Email Sequences', desc: 'Edit cold email templates', icon: Mail },
            ].map(({ to, label, desc, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Icon size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Target, Percent } from 'lucide-react';

interface Overview {
  total_clients: number;
  active_clients: number;
  total_leads_all_time: number;
  total_leads_this_month: number;
  total_closed_all_time: number;
  total_opted_out_all_time: number;
  avg_conversion_rate: number;
}

interface Client {
  client_id: string;
  client_name: string;
  active: boolean;
  total_leads: number;
  hot_leads: number;
  total_closed: number;
  conversion_rate: number;
  leads_this_week: number;
}

export default function Dashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/stats/overview'),
      api.get('/clients')
    ]).then(([overviewRes, clientsRes]) => {
      setOverview(overviewRes.data);
      setClients(clientsRes.data);
    }).catch(err => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  }, [navigate]);

  if (!overview) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clients" value={overview.total_clients} icon={<Users className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Leads This Month" value={overview.total_leads_this_month} icon={<UserPlus className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Closed" value={overview.total_closed_all_time} icon={<Target className="w-6 h-6 text-purple-500" />} />
        <StatCard title="Avg Conversion Rate" value={`${overview.avg_conversion_rate}%`} icon={<Percent className="w-6 h-6 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-zinc-100">Client Status</h3>
          <div className="grid gap-4">
            {clients.map(c => (
              <div key={c.client_id} className="bg-zinc-950/50 border border-zinc-800/50 p-4 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-100">{c.client_name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  </div>
                  <div className="text-sm text-zinc-400 mt-1 flex gap-3">
                    <span>{c.total_leads} leads</span>
                    <span>{c.hot_leads} HOT</span>
                    <span>{c.total_closed} closed</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-medium">{c.conversion_rate}% conv.</div>
                  <button onClick={() => navigate(`/clients/${c.client_id}`)} className="text-sm text-zinc-500 hover:text-white mt-1 transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4 hover:bg-zinc-900 transition-colors">
      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
      </div>
    </div>
  )
}

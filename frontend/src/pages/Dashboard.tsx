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

  if (!overview) return (
    <div className="flex items-center justify-center p-20">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Clients" value={overview.total_clients} icon={<Users size={20} className="text-gray-400" />} />
        <StatCard title="Leads This Month" value={overview.total_leads_this_month} icon={<UserPlus size={20} className="text-gray-400" />} />
        <StatCard title="Total Closed" value={overview.total_closed_all_time} icon={<Target size={20} className="text-gray-400" />} />
        <StatCard title="Avg Conversion Rate" value={`${overview.avg_conversion_rate}%`} icon={<Percent size={20} className="text-gray-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-6">
          <h3 className="text-gray-100 font-bold tracking-tight mb-6">Client Status</h3>
          <div className="grid gap-3">
            {clients.map(c => (
              <div 
                key={c.client_id} 
                onClick={() => navigate(`/clients/${c.client_id}`)}
                className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl flex items-center justify-between hover:bg-white/[0.04] transition-colors duration-300 cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-200">{c.client_name}</span>
                    {c.active ? (
                      <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase">Active</span>
                    ) : (
                      <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase">Inactive</span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-2 flex gap-4">
                    <span>{c.total_leads} leads</span>
                    <span>{c.hot_leads} HOT</span>
                    <span>{c.total_closed} closed</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 font-semibold">{c.conversion_rate}% conv.</div>
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-2">
                    View →
                  </div>
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
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
      <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-bold tracking-tight text-white mt-1">{value}</p>
      </div>
    </div>
  )
}

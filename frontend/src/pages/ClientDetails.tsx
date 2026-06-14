import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Activity, Target, Flame, XCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get(`/clients/${id}`),
      api.get(`/clients/${id}/stats/daily`)
    ]).then(([detailsRes, dailyRes]) => {
      setData(detailsRes.data);
      setDailyStats(dailyRes.data);
    });
  }, [id]);

  if (!data) return <div className="p-8 text-center text-zinc-400">Loading...</div>;

  const c = data.client;
  const events = data.recent_events;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {c.client_name}
            <span className={`text-xs px-2 py-1 rounded-full ${c.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {c.active ? 'Active' : 'Inactive'}
            </span>
          </h2>
          <p className="text-zinc-500 text-sm mt-1">{c.railway_url}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><Activity className="w-4 h-4" /> Total Leads</div>
          <div className="text-2xl font-bold mt-1 text-white">{c.total_leads}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> HOT</div>
          <div className="text-2xl font-bold mt-1 text-white">{c.hot_leads}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Closed</div>
          <div className="text-2xl font-bold mt-1 text-white">{c.total_closed}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
          <div className="text-sm text-zinc-400 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Opted Out</div>
          <div className="text-2xl font-bold mt-1 text-white">{c.total_opted_out}</div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6 text-zinc-100">Daily Leads (30 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
              <YAxis stroke="#52525b" fontSize={12} allowDecimals={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="closed" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100">Recent Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950 text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">Stage Change</th>
                <th className="px-6 py-3 font-medium">Score</th>
                <th className="px-6 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {events.map((e: any) => (
                <tr key={e.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-zinc-300">{e.event_type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {e.from_stage && e.to_stage ? `${e.from_stage} → ${e.to_stage}` : (e.to_stage || '-')}
                  </td>
                  <td className="px-6 py-4">
                    {e.lead_score && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        e.lead_score === 'HOT' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                        e.lead_score === 'WARM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {e.lead_score}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No recent events</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

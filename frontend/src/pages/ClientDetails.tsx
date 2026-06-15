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

  if (!data) return (
    <div className="flex items-center justify-center p-20">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
    </div>
  );

  const c = data.client;
  const events = data.recent_events;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-lg hover:bg-white/[0.06] text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            {c.client_name}
            {c.active ? (
              <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase">Active</span>
            ) : (
              <span className="bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase">Inactive</span>
            )}
          </h2>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mt-1">{c.railway_url}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Activity size={16} /> Total Leads</div>
          <div className="text-2xl font-bold tracking-tight text-white">{c.total_leads}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Flame size={16} className="text-orange-500" /> HOT</div>
          <div className="text-2xl font-bold tracking-tight text-white">{c.hot_leads}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2"><Target size={16} className="text-emerald-500" /> Closed</div>
          <div className="text-2xl font-bold tracking-tight text-white">{c.total_closed}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-5">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2"><XCircle size={16} className="text-red-500" /> Opted Out</div>
          <div className="text-2xl font-bold tracking-tight text-white">{c.total_opted_out}</div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md p-6">
        <h3 className="font-bold tracking-tight text-white mb-6">Daily Leads (30 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', backdropFilter: 'blur(12px)' }}
                itemStyle={{ color: '#f4f4f5', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="leads" stroke="#06b6d4" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff' }} />
              <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/[0.05]">
          <h3 className="font-bold tracking-tight text-white">Recent Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Event</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Stage Change</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Score</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-gray-500 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {events.map((e: any) => (
                <tr key={e.id} className="hover:bg-white/[0.02] transition-colors duration-300">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-200">{e.event_type.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {e.from_stage && e.to_stage ? `${e.from_stage} → ${e.to_stage}` : (e.to_stage || '-')}
                  </td>
                  <td className="px-6 py-4">
                    {e.lead_score && (
                      <span className={`px-2 py-1 rounded text-[10px] font-semibold tracking-widest uppercase ${
                        e.lead_score === 'HOT' ? 'bg-orange-500/10 text-orange-300 border border-orange-500/20' : 
                        e.lead_score === 'WARM' ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' : 
                        'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      }`}>
                        {e.lead_score}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-widest">No recent events</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

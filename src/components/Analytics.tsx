import { useMemo } from 'react';
import { Voter, Precinct, Affiliation } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, MapPin, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  voters: Voter[];
  precincts: Precinct[];
}

export default function Analytics({ voters, precincts }: Props) {
  const clusters = useMemo(() => Array.from(new Set(precincts.map(p => p.cluster))).filter(Boolean), [precincts]);
  const barangays = useMemo(() => Array.from(new Set(precincts.map(p => p.barangay))).filter(Boolean), [precincts]);

  const chartData = useMemo(() => {
    const counts = voters.reduce((acc, v) => {
      acc[v.affiliationColor] = (acc[v.affiliationColor] || 0) + 1;
      return acc;
    }, {} as Record<Affiliation, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [voters]);

  const COLORS: Record<string, string> = {
    Red: '#B31942',
    Blue: '#0A3161',
    Neutral: '#94A3B8',
    Other: '#7C3AED'
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-gov-navy">Strategic Intelligence Dashboard</h2>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center justify-center rounded-lg bg-white px-4 font-mono text-[9px] uppercase tracking-widest text-gov-navy shadow-sm border border-gov-navy/10 font-bold">
            Data Matrix Status: Synced
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Registered', value: voters.length, icon: Users, color: 'bg-gov-navy' },
          { label: 'Operational Precincts', value: precincts.length, icon: MapPin, color: 'bg-gov-gold text-gov-navy' },
          { label: 'Active Clusters', value: clusters.length, icon: TrendingUp, color: 'bg-white border border-gov-navy/10 text-gov-navy' },
          { label: 'Active Barangays', value: barangays.length, icon: Activity, color: 'bg-gov-red' }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-gov-navy/10 bg-white p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} shadow-sm`}>
              <stat.icon size={20} />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-gov-slate/40 font-black">{stat.label}</p>
            <h3 className="mt-1 font-serif text-3xl font-bold text-gov-navy">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Pie Chart Card */}
        <div className="lg:col-span-2 rounded-2xl border border-gov-navy/10 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-serif font-bold text-gov-navy">Affiliation Sentiment Matrix</h3>
            <div className="text-[10px] font-mono text-gov-slate/40 uppercase font-black">Live Pulse Data</div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#CBD5E1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '10px',
                    padding: '8px 12px'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="rect"
                  formatter={(value) => <span className="font-mono text-[10px] uppercase font-black text-gov-navy ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrative / Insights Card */}
        <div className="rounded-2xl bg-gov-navy p-8 text-white shadow-xl flex flex-col border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-gov-gold" />
            <h3 className="text-lg font-bold">Executive Intelligence Summary</h3>
          </div>
          
          <div className="space-y-6 flex-1 text-sm leading-relaxed opacity-90">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[9px] font-black uppercase text-gov-gold mb-1">Observation Sector A</p>
              <p className="text-xs">Based on latest registry syncing, Iligan City currently maintains a {voters.length > 0 ? ((voters.filter(d => d.affiliationColor === 'Neutral').length / voters.length) * 100).toFixed(1) : 0}% Neutral registration index.</p>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[9px] font-black uppercase text-gov-gold mb-1">Hierarchy Density Analysis</p>
              <p className="text-xs">Precinct saturation indicates that high-voter barangays like {barangays[0] || 'Maria Cristina'} and {barangays[1] || 'Buru-un'} are reaching peak registration capacity in {clusters[0] || 'Cluster I'}.</p>
            </div>

            <div className="p-5 bg-gov-gold text-gov-navy rounded-xl shadow-lg">
              <p className="text-[10px] font-black uppercase mb-1">Strategic Directive</p>
              <p className="text-[11px] font-bold">Focus intelligence efforts on neutral-coded sectors to consolidate administrative oversight in Dalipuga and Buru-un precincts.</p>
            </div>
          </div>
          
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] font-mono opacity-40 uppercase tracking-widest text-center">Protocol V-METRIC-23 // Secure Connection</p>
          </div>
        </div>
      </div>
    </div>
  );
}

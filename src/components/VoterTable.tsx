import { useState, useMemo, useEffect } from 'react';
import { Voter, Affiliation, Precinct } from '../types';
import { ChevronUp, ChevronDown, MoreHorizontal, Phone, Home, Users, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAffiliationStyles } from '../lib/utils';

interface Props {
  voters: Voter[];
  loading: boolean;
  precincts: Precinct[];
  masterView?: boolean;
  onEdit?: (voter: Voter) => void;
  onDelete?: (voterId: string) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

type SortKey = keyof Voter;

export default function VoterTable({ voters, loading, precincts, masterView, onEdit, onDelete, fetchNextPage, hasNextPage, isFetchingNextPage }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'none' | 'precinct' | 'affiliation' | 'cluster' | 'barangay'>('none');

  const sortedVoters = useMemo(() => {
    return [...voters].sort((a, b) => {
      const valA = (a[sortKey] || '').toString().toLowerCase();
      const valB = (b[sortKey] || '').toString().toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [voters, sortKey, sortOrder]);

  const groupedVoters = useMemo(() => {
    if (groupBy === 'none') return null;
    const groups: Record<string, Voter[]> = {};
    sortedVoters.forEach(v => {
      let key = '';
      if (groupBy === 'precinct') key = v.precinctName;
      else if (groupBy === 'affiliation') key = v.affiliationColor;
      else if (groupBy === 'cluster') key = v.cluster || 'Unknown Cluster';
      else if (groupBy === 'barangay') key = v.barangay || 'Unknown Barangay';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });
    return groups;
  }, [sortedVoters, groupBy]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Full Name', 'Cluster', 'Barangay', 'Precinct', 'Affiliation', 'Address', 'Contact Number'];
    
    const sanitize = (val: any) => {
      let str = String(val || '').replace(/"/g, '""');
      if (/^[=\-@+]/.test(str)) {
        str = "'" + str; 
      }
      return `"${str}"`;
    };

    const rows = sortedVoters.map(v => [
      sanitize(v.fullName),
      sanitize(v.cluster),
      sanitize(v.barangay),
      sanitize(v.precinctName),
      sanitize(v.affiliationColor),
      sanitize(v.address),
      sanitize(v.contactNumber)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voter_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeColor = getAffiliationStyles;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-white border border-gov-navy/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 bg-white p-1 rounded-xl border border-gov-navy/10 shadow-sm">
          <button 
            onClick={() => setGroupBy('none')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${groupBy === 'none' ? 'bg-gov-navy text-white shadow' : 'text-gov-navy/40 hover:text-gov-navy'}`}
          >
            All List
          </button>
          <button 
            onClick={() => setGroupBy('cluster')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${groupBy === 'cluster' ? 'bg-gov-navy text-white shadow' : 'text-gov-navy/40 hover:text-gov-navy'}`}
          >
            By Cluster
          </button>
          <button 
            onClick={() => setGroupBy('barangay')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${groupBy === 'barangay' ? 'bg-gov-navy text-white shadow' : 'text-gov-navy/40 hover:text-gov-navy'}`}
          >
            By Barangay
          </button>
          <button 
            onClick={() => setGroupBy('precinct')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${groupBy === 'precinct' ? 'bg-gov-navy text-white shadow' : 'text-gov-navy/40 hover:text-gov-navy'}`}
          >
            By Precinct
          </button>
          <button 
            onClick={() => setGroupBy('affiliation')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${groupBy === 'affiliation' ? 'bg-gov-navy text-white shadow' : 'text-gov-navy/40 hover:text-gov-navy'}`}
          >
            By Affiliation
          </button>
        </div>

        {masterView && (
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 rounded-lg border border-gov-navy/20 bg-white px-5 py-2.5 text-xs font-bold text-gov-navy hover:bg-gov-bg transition-all shadow-sm"
          >
            <Database size={14} />
            Export to CSV
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gov-navy/10 bg-white overflow-hidden shadow-lg">
        {/* Header */}
        <div className="grid grid-cols-[1.5fr_0.8fr_1fr_1fr_1fr_1.5fr_1fr_40px] border-b border-gov-navy/10 bg-gov-navy text-white">
          {[
            { key: 'fullName', label: 'Identity' },
            { key: 'cluster', label: 'Cluster' },
            { key: 'barangay', label: 'Barangay' },
            { key: 'precinctName', label: 'Sector' },
            { key: 'affiliationColor', label: 'Affiliation' },
            { key: 'address', label: 'Residence' },
            { key: 'contactNumber', label: 'Contact' }
          ].map((col) => (
            <button 
              key={col.key}
              onClick={() => toggleSort(col.key as SortKey)}
              className="flex items-center gap-2 px-4 py-4 text-left font-mono text-[8px] uppercase tracking-widest hover:bg-white/10 transition-all font-bold group-header-btn"
            >
              {col.label}
              {sortKey === col.key && (
                sortOrder === 'asc' ? <ChevronUp size={10} className="text-gov-gold" /> : <ChevronDown size={10} className="text-gov-gold" />
              )}
            </button>
          ))}
          <div className="px-4 py-4" />
        </div>

        {/* Body */}
        <div className="divide-y divide-gov-navy/5">
          {groupBy === 'none' ? (
            <AnimatePresence>
              {sortedVoters.map((voter) => (
                <VoterRow key={voter.id} voter={voter} getBadgeColor={getBadgeColor} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </AnimatePresence>
          ) : (
            Object.entries(groupedVoters || {}).map(([groupName, members]) => (
              <div key={groupName} className="bg-gov-bg/30">
                <div className="px-6 py-3 bg-gov-navy/5 border-b border-gov-navy/10 flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gov-navy">
                    {groupBy.toUpperCase()}: {groupName}
                  </h4>
                  <span className="bg-gov-navy text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{(members as Voter[]).length} Records</span>
                </div>
                {(members as Voter[]).map(v => (
                  <VoterRow key={v.id} voter={v} getBadgeColor={getBadgeColor} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            ))
          )}

          {sortedVoters.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gov-navy/10">
              <Users size={64} strokeWidth={1} />
              <p className="mt-4 font-serif font-bold text-xl text-gov-navy/40 italic">No Registry Entries Found</p>
            </div>
          )}

          {hasNextPage && (
            <div className="flex justify-center p-6 bg-white border-t border-gov-navy/5">
              <button
                onClick={() => fetchNextPage?.()}
                disabled={isFetchingNextPage}
                className="rounded-lg bg-gov-navy/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gov-navy hover:bg-gov-navy hover:text-white transition-all disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading more records...' : 'Load More Records'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface VoterRowProps {
  voter: Voter;
  getBadgeColor: (aff: Affiliation) => string;
  onEdit?: (voter: Voter) => void;
  onDelete?: (voterId: string) => void;
  key?: string;
}

function VoterRow({ voter, getBadgeColor, onEdit, onDelete }: VoterRowProps) {
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!showOptions) return;
    const close = () => setShowOptions(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showOptions]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group grid grid-cols-[1.5fr_0.8fr_1fr_1fr_1fr_1.5fr_1fr_40px] items-center hover:bg-gov-navy/5 transition-all duration-200 cursor-default bg-white relative"
    >
      <div className="px-4 py-4 font-bold text-gov-navy text-xs">{voter.fullName}</div>
      <div className="px-4 py-4 font-mono text-[9px] text-gov-slate/60">{voter.cluster || '--'}</div>
      <div className="px-4 py-4 font-mono text-[9px] text-gov-slate/60 italic">{voter.barangay || '--'}</div>
      <div className="px-4 py-4 font-mono text-[9px] text-gov-slate/40">{voter.precinctName}</div>
      <div className="px-4 py-4">
        <span className={`inline-block rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-transparent shadow-sm ${getBadgeColor(voter.affiliationColor)}`}>
          {voter.affiliationColor}
        </span>
      </div>
      <div className="flex items-center gap-2 px-4 py-4 text-[10px] text-gov-slate/80 font-medium">
        <Home size={10} className="shrink-0 text-gov-navy/20" />
        <span className="truncate">{voter.address}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-4 font-mono text-[9px] text-gov-slate/60">
        <Phone size={10} className="shrink-0 text-gov-navy/20" />
        {voter.contactNumber || '--'}
      </div>
      <div className="flex justify-center pr-4 relative">
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gov-navy/5 rounded-full text-gov-navy/40"
        >
          <MoreHorizontal size={16} />
        </button>

        {showOptions && (
          <div className="absolute right-12 top-0 z-10 w-32 rounded-lg border border-gov-navy/10 bg-white shadow-xl">
            <button 
              onClick={() => { onEdit?.(voter); setShowOptions(false); }}
              className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-gov-navy hover:bg-gov-bg"
            >
              Modify Record
            </button>
            <button 
              onClick={() => { if(confirm('Delete this record?')) onDelete?.(voter.id); setShowOptions(false); }}
              className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-gov-red hover:bg-gov-red/5"
            >
              Purge File
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}


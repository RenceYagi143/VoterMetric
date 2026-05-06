import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MapPin, 
  BarChart3, 
  Search, 
  Filter, 
  Plus, 
  LogOut,
  ChevronDown,
  List,
  Database
} from 'lucide-react';
import { logOut, auth, db as fireDb } from '../lib/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useVoters, usePrecincts } from '../hooks/useData';
import { resetAndSeedDatabase } from '../lib/seed';
import VoterTable from './VoterTable';
import PrecinctManager from './PrecinctManager';
import Analytics from './Analytics';
import { Affiliation, Voter } from '../types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'precincts' | 'all-info' | 'settings'>('dashboard');
  const [precinctFilter, setPrecinctFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState<Voter | null>(null);
  const [seeding, setSeeding] = useState(false);

  const { voters, loading: votersLoading } = useVoters({ 
    precinctId: precinctFilter
  });

  const filteredVoters = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return voters;
    
    return voters.filter(v => {
      const nameMatch = v.fullName.toLowerCase().includes(searchLower);
      const addressMatch = v.address.toLowerCase().includes(searchLower);
      const precinctMatch = v.precinctName.toLowerCase().includes(searchLower);
      const affiliationMatch = v.affiliationColor.toLowerCase().includes(searchLower);

      if (searchCategory === 'Name') return nameMatch;
      if (searchCategory === 'Address') return addressMatch;
      if (searchCategory === 'Precinct') return precinctMatch;
      if (searchCategory === 'Political Affiliation') return affiliationMatch;
      
      return nameMatch || addressMatch || precinctMatch || affiliationMatch;
    });
  }, [voters, searchQuery, searchCategory]);
  
  const { precincts } = usePrecincts();

  const handleSeed = async () => {
    if (!confirm('This will WIPE all current records and replace them with Iligan City sector data. Proceed?')) return;
    
    setSeeding(true);
    try {
      await resetAndSeedDatabase();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gov-bg font-sans text-gov-slate">
      {/* Sidebar */}
      <aside className="flex w-72 flex-col border-r border-gov-navy/10 bg-white">
        <div className="p-8 bg-gov-navy text-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-gov-gold flex items-center justify-center">
              <Database size={18} className="text-gov-navy" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight">VoterMetric</h1>
              <p className="font-mono text-[9px] uppercase tracking-widest opacity-60">Gov. Information System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 mt-6 space-y-1 px-3">
          {[
            { id: 'dashboard', label: 'Dashboard / Insights', icon: BarChart3 },
            { id: 'precincts', label: 'Precinct Registry', icon: MapPin },
            { id: 'all-info', label: 'All Information', icon: List },
            { id: 'settings', label: 'Settings / Profile', icon: Database },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold tracking-tight transition-all ${activeTab === item.id ? 'bg-gov-navy text-white shadow-md' : 'text-gov-slate/60 hover:bg-gov-bg hover:text-gov-navy'}`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gov-navy/5">
          <button 
            onClick={handleSeed}
            disabled={seeding}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gov-red/20 bg-gov-red/5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gov-red hover:bg-gov-red hover:text-white transition-all disabled:opacity-50"
          >
            <Database size={14} />
            {seeding ? 'Processing...' : 'Reset & Seed Data'}
          </button>
          
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gov-bg border border-gov-navy/5">
            <div className="h-10 w-10 rounded-full bg-gov-navy text-white flex items-center justify-center font-bold text-sm">
              {auth.currentUser?.email?.substring(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-bold text-gov-navy">{auth.currentUser?.email}</p>
              <p className="text-[9px] font-mono uppercase text-gov-gold">Verified Clerk</p>
            </div>
            <button onClick={() => logOut()} className="text-gov-red hover:opacity-70 transition-opacity">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header Search Engine */}
        <header className="flex h-20 items-center bg-white border-b border-gov-navy/10 px-8 gap-4">
          <div className="flex-1 flex max-w-2xl bg-gov-bg rounded-lg overflow-hidden border border-gov-navy/10 focus-within:ring-2 focus-within:ring-gov-navy/20 transition-all">
            <select 
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="bg-white border-r border-gov-navy/10 px-4 text-xs font-bold text-gov-navy outline-none cursor-pointer hover:bg-gray-50"
            >
              <option>All</option>
              <option>Name</option>
              <option>Address</option>
              <option>Precinct</option>
              <option>Political Affiliation</option>
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gov-navy/40" size={16} />
              <input 
                type="text" 
                placeholder={`Search the national registry by ${searchCategory.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Logic already handled by useVoters reacting toQuery
                  }
                }}
                className="w-full bg-transparent py-3 pl-10 pr-4 text-sm font-medium outline-none text-gov-navy placeholder:text-gov-navy/30"
              />
            </div>
          </div>
          
          <div className="flex-1" />

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-gov-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition-all shadow-md active:scale-95"
          >
            <Plus size={16} />
            Add New Record
          </button>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            {(!editingVoter && !showAddModal) && (
              <>
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Analytics voters={filteredVoters} precincts={precincts} />
                  </motion.div>
                )}

                {activeTab === 'precincts' && (
                  <motion.div
                    key="precincts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <PrecinctManager 
                      precincts={precincts} 
                      voters={filteredVoters} 
                      onEditVoter={(voter) => setEditingVoter(voter)}
                    />
                  </motion.div>
                )}

                {activeTab === 'all-info' && (
                  <motion.div
                    key="all-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <VoterTable 
                      voters={filteredVoters} 
                      loading={votersLoading} 
                      precincts={precincts}
                      masterView
                      onEdit={(voter) => setEditingVoter(voter)}
                      onDelete={async (id) => {
                        try {
                          await deleteDoc(doc(fireDb, 'voters', id));
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl space-y-8"
                  >
                    <div className="bg-white p-10 rounded-2xl border border-gov-navy/10 shadow-sm">
                      <h2 className="text-2xl font-serif font-bold text-gov-navy mb-4">System Settings</h2>
                      <p className="text-gov-slate/60 mb-8 border-b pb-8">Manage application parameters and core registry protocols.</p>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gov-bg rounded-lg">
                          <div>
                            <p className="font-bold text-gov-navy">Authorized Domain Access</p>
                            <p className="text-xs text-gov-slate/60">Restricts entry to official network nodes.</p>
                          </div>
                          <div className="h-6 w-12 bg-gov-navy rounded-full relative">
                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white border border-gov-navy/10 rounded-lg">
                          <div>
                            <p className="font-bold text-gov-navy">Reset Application Experience</p>
                            <p className="text-xs text-gov-slate/60">Clears onboarding status to view the introduction again.</p>
                          </div>
                          <button 
                            onClick={() => {
                              localStorage.removeItem('hasSeenOnboarding');
                              window.location.reload();
                            }}
                            className="px-4 py-2 bg-gov-bg text-gov-navy text-[10px] font-black uppercase tracking-widest rounded-lg border border-gov-navy/10 hover:bg-gov-navy hover:text-white transition-all shadow-sm"
                          >
                            Reset Onboarding
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white border border-gov-navy/10 rounded-lg">
                          <div>
                            <p className="font-bold text-gov-navy font-serif">Initialize Real Iligan Data</p>
                            <p className="text-xs text-gov-slate/60">Populates the database with real Cluster I records provided.</p>
                          </div>
                          <button 
                            onClick={async (e) => {
                              const btn = e.currentTarget;
                              const originalText = btn.innerText;
                              btn.innerText = "INITIALIZING...";
                              btn.disabled = true;
                              try {
                                await resetAndSeedDatabase();
                                alert("Database successfully populated with real Iligan Cluster I data!");
                                window.location.reload();
                              } catch (err) {
                                alert("Error during seeding. Check console.");
                                console.error(err);
                                btn.innerText = originalText;
                                btn.disabled = false;
                              }
                            }}
                            className="px-4 py-2 bg-gov-gold text-gov-navy text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-95"
                          >
                            Seed Real Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      {(showAddModal || editingVoter) && (
        <VoterFormModal 
          onClose={() => {
            setShowAddModal(false);
            setEditingVoter(null);
          }} 
          precincts={precincts} 
          initialVoter={editingVoter || undefined}
        />
      )}
    </div>
  );
}

// Sub-component for adding voter
function VoterFormModal({ onClose, precincts, initialVoter }: { onClose: () => void, precincts: any[], initialVoter?: Voter }) {
  const [formData, setFormData] = useState({
    fullName: initialVoter?.fullName || '',
    precinctId: initialVoter?.precinctId || '',
    affiliationColor: (initialVoter?.affiliationColor || 'Neutral') as Affiliation,
    address: initialVoter?.address || '',
    contactNumber: initialVoter?.contactNumber || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedPrecinct = precincts.find(p => p.id === formData.precinctId);
      const voterData = {
        ...formData,
        precinctName: selectedPrecinct?.name || 'Unknown',
        barangay: selectedPrecinct?.barangay || 'Unknown',
        cluster: selectedPrecinct?.cluster || 'Unknown',
        updatedAt: serverTimestamp(),
      };

      if (initialVoter) {
        await updateDoc(doc(fireDb, 'voters', initialVoter.id), voterData);
      } else {
        await addDoc(collection(fireDb, 'voters'), {
          ...voterData,
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gov-navy/60 backdrop-blur-sm p-6">
      <motion.div 
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="bg-gov-navy p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{initialVoter ? 'Edit Citizen Record' : 'New Voter Registration'}</h2>
            <p className="text-[10px] font-mono tracking-widest text-gov-gold opacity-80 uppercase mt-1">Official Document Entry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors font-mono">X</button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Full Legal Name</label>
              <input 
                required
                className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy transition-all" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="Last Name, First Name Middle Initial"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Sector Code</label>
                <select 
                  required
                  className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                  value={formData.precinctId}
                  onChange={e => setFormData({...formData, precinctId: e.target.value})}
                >
                  <option value="">Select Precinct...</option>
                  {precincts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Affiliation</label>
                <select 
                  required
                  className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                  value={formData.affiliationColor}
                  onChange={e => setFormData({...formData, affiliationColor: e.target.value as Affiliation})}
                >
                  <option value="Neutral">Neutral / Undecided</option>
                  <option value="Red">Red Party</option>
                  <option value="Blue">Blue Party</option>
                  <option value="Other">Other Party</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Residential Address</label>
              <input 
                required
                className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="Purok, Barangay, Iligan City"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Contact Information</label>
              <input 
                className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy" 
                value={formData.contactNumber}
                onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                placeholder="09XXXXXXXXX"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gov-navy/20 py-3 text-xs font-bold text-gov-navy hover:bg-gov-bg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gov-navy py-3 text-xs font-bold text-white shadow-md hover:bg-blue-900 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : (initialVoter ? 'Commit Updates' : 'Register Person')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

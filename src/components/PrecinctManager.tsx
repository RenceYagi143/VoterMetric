import React, { useState } from 'react';
import { Precinct, OperationType, Voter } from '../types';
import { MapPin, Plus, Trash2, Edit2, Info, Users, BarChart3, Activity, Mail, Phone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDoc, deleteDoc, doc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError } from '../lib/error-handler';

interface Props {
  precincts: Precinct[];
  voters: Voter[];
  onEditVoter?: (voter: Voter) => void;
}

export default function PrecinctManager({ precincts, voters, onEditVoter }: Props) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrecinct, setSelectedPrecinct] = useState<Precinct | null>(null);
  const [editingPrecinct, setEditingPrecinct] = useState<Precinct | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [clusterInput, setClusterInput] = useState('');
  const [barangayInput, setBarangayInput] = useState('');

  const clusters = Array.from(new Set(precincts.map(p => p.cluster))).filter(Boolean);
  const barangays = Array.from(new Set(precincts.filter(p => !selectedCluster || p.cluster === selectedCluster).map(p => p.barangay))).filter(Boolean);

  const filteredPrecincts = precincts.filter(p => 
    (!selectedCluster || p.cluster === selectedCluster) && 
    (!selectedBarangay || p.barangay === selectedBarangay)
  );

  const openAdd = () => {
    setEditingPrecinct(null);
    setName('');
    setLocation('');
    setImageUrl('');
    setClusterInput(selectedCluster || '');
    setBarangayInput(selectedBarangay || '');
    setShowModal(true);
  };

  const openEdit = (p: Precinct) => {
    setEditingPrecinct(p);
    setName(p.name);
    setLocation(p.location_details);
    setImageUrl(p.imageUrl);
    setClusterInput(p.cluster);
    setBarangayInput(p.barangay);
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Confirm decommissioning of Sector ${name}? This will remove all registry links.`)) return;
    try {
      await deleteDoc(doc(db, 'precincts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `precincts/${id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        barangay: barangayInput,
        cluster: clusterInput,
        location_details: location,
        imageUrl: imageUrl || `https://images.unsplash.com/photo-1577493340887-b7bfff550145?auto=format&fit=crop&q=80&w=1000`,
        updatedAt: serverTimestamp()
      };

      if (editingPrecinct) {
        await updateDoc(doc(db, 'precincts', editingPrecinct.id), data);
      } else {
        await addDoc(collection(db, 'precincts'), {
          ...data,
          total_voters: 0,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
    } catch (err) {
      handleFirestoreError(err, editingPrecinct ? OperationType.UPDATE : OperationType.CREATE, 'precincts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gov-navy">Precinct Registry Matrix</h2>
          <p className="text-sm text-gov-slate/60 mt-1">Hierarchical oversight of clusters, barangays, and administrative sectors.</p>
        </div>
        <button 
          onClick={openAdd}
          className="flex items-center gap-3 rounded-lg bg-gov-navy px-6 py-3 text-xs font-bold text-white hover:bg-blue-900 transition-all shadow-lg active:scale-95 self-start"
        >
          <Plus size={18} />
          Register New Sector
        </button>
      </div>

      {/* Filter Navigation */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => { setSelectedCluster(null); setSelectedBarangay(null); }}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${!selectedCluster ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white text-gov-navy border-gov-navy/10 hover:border-gov-navy/30'}`}
          >
            All Clusters
          </button>
          {clusters.map(cluster => (
            <button 
              key={cluster}
              onClick={() => { setSelectedCluster(cluster); setSelectedBarangay(null); }}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCluster === cluster ? 'bg-gov-navy text-white border-gov-navy' : 'bg-white text-gov-navy border-gov-navy/10 hover:border-gov-navy/30'}`}
            >
              {cluster}
            </button>
          ))}
        </div>

        {selectedCluster && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 pt-2 border-t border-gov-navy/5"
          >
            <button 
              onClick={() => setSelectedBarangay(null)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${!selectedBarangay ? 'bg-gov-gold text-gov-navy border-gov-gold' : 'bg-white text-gov-navy border-gov-navy/10 hover:border-gov-navy/30'}`}
            >
              All Barangays
            </button>
            {barangays.map(brgy => (
              <button 
                key={brgy}
                onClick={() => setSelectedBarangay(brgy)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedBarangay === brgy ? 'bg-gov-gold text-gov-navy border-gov-gold' : 'bg-white text-gov-navy border-gov-navy/10 hover:border-gov-navy/30'}`}
              >
                {brgy}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredPrecincts.map((precinct) => (
            <motion.div 
              layout
              key={precinct.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative flex flex-col rounded-2xl bg-white border border-gov-navy/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all"
            >
              {/* Image Header */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={precinct.imageUrl} 
                  alt={precinct.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gov-navy/90 via-gov-navy/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <p className="text-[10px] font-mono text-gov-gold uppercase tracking-[0.3em] font-black drop-shadow-md">Sector Verified</p>
                  <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md">{precinct.name}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gov-navy/30 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-gov-slate/80 leading-relaxed italic">
                    {precinct.location_details}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="bg-gov-bg p-3 rounded-xl border border-gov-navy/5 flex flex-col items-center flex-1">
                    <span className="text-[9px] font-black text-gov-navy/40 uppercase mb-1">Pop. Density</span>
                    <span className="text-xl font-serif font-bold text-gov-navy">{precinct.total_voters}</span>
                  </div>
                  <div className="bg-gov-bg p-3 rounded-xl border border-gov-navy/5 flex flex-col items-center flex-1">
                    <span className="text-[9px] font-black text-gov-navy/40 uppercase mb-1">Status</span>
                    <span className="text-xs font-bold text-green-600">Active</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedPrecinct(precinct)}
                    className="flex-1 rounded-lg bg-gov-navy text-white text-[10px] font-black uppercase tracking-widest py-3 hover:bg-blue-900 transition-all shadow-md active:scale-[0.98]"
                  >
                    View Analytics
                  </button>
                  <button 
                    onClick={() => handleDelete(precinct.id, precinct.name)}
                    className="p-3 rounded-lg border border-gov-red/20 text-gov-red hover:bg-gov-red hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Drill-down UI Overlay */}
      <AnimatePresence>
        {selectedPrecinct && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-gov-navy/80 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 100 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 100 }}
               className="w-full max-w-4xl max-h-[80vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            >
              <div className="relative h-64">
                <img 
                  src={selectedPrecinct.imageUrl} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedPrecinct(null)}
                  className="absolute top-6 right-6 h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-gov-navy transition-all"
                >
                  X
                </button>
              </div>
              <div className="p-10 space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-gov-navy">{selectedPrecinct.name}</h2>
                    <p className="flex items-center gap-2 text-gov-slate/60 mt-2 font-medium">
                      <MapPin size={16} />
                      {selectedPrecinct.location_details}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-mono font-black text-gov-gold uppercase tracking-[0.2em] mb-1">ID: {selectedPrecinct.id}</p>
                    <p className="text-3xl font-serif font-bold text-gov-navy">{selectedPrecinct.total_voters} Registered</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 rounded-2xl bg-gov-bg border border-gov-navy/5">
                      <div className="flex items-center gap-2 text-gov-navy/40 mb-2">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Growth Index</span>
                      </div>
                      <p className="text-2xl font-serif font-bold text-gov-navy">+12% Monthly</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-gov-navy text-white">
                      <div className="flex items-center gap-2 text-white/40 mb-2">
                        <BarChart3 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Polling Data</span>
                      </div>
                      <p className="text-2xl font-serif font-bold text-gov-gold">High Engagement</p>
                   </div>
                   <div className="p-6 rounded-2xl bg-gov-bg border border-gov-navy/5">
                      <div className="flex items-center gap-2 text-gov-navy/40 mb-2">
                        <Activity size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sync Health</span>
                      </div>
                      <p className="text-2xl font-serif font-bold text-green-600">Optimal</p>
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gov-navy/10 pb-4">
                    <h3 className="text-xl font-serif font-bold text-gov-navy">Registered Entities</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gov-gold bg-gov-navy px-3 py-1 rounded-full">
                      Total: {voters.filter(v => v.precinctId === selectedPrecinct.id).length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {voters.filter(v => v.precinctId === selectedPrecinct.id).map((voter) => (
                      <div key={voter.id} className="p-4 rounded-xl bg-gov-bg border border-gov-navy/5 flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${
                            voter.affiliationColor === 'Red' ? 'bg-red-600' :
                            voter.affiliationColor === 'Blue' ? 'bg-blue-600' :
                            voter.affiliationColor === 'Neutral' ? 'bg-gray-400' : 'bg-purple-600'
                          }`}>
                            {voter.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gov-navy">{voter.fullName}</p>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-[10px] text-gov-slate/60 flex items-center gap-1 italic">
                                <MapPin size={10} />
                                {voter.address}
                              </p>
                              {voter.contactNumber && (
                                <p className="text-[10px] text-gov-slate/40 flex items-center gap-1 font-mono">
                                  <Phone size={10} />
                                  {voter.contactNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              voter.affiliationColor === 'Red' ? 'text-red-600 border-red-200 bg-red-50' :
                              voter.affiliationColor === 'Blue' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                              voter.affiliationColor === 'Neutral' ? 'text-gray-600 border-gray-200 bg-gray-50' : 'text-purple-600 border-purple-200 bg-purple-50'
                            }`}>
                              {voter.affiliationColor}
                            </p>
                          </div>
                          <button 
                            onClick={() => onEditVoter?.(voter)}
                            className="p-2 hover:bg-gov-navy/10 rounded-full text-gov-navy/40 transition-colors"
                            title="Modify Record"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {voters.filter(v => v.precinctId === selectedPrecinct.id).length === 0 && (
                      <div className="p-8 bg-gov-bg rounded-2xl border border-dashed border-gov-navy/10 flex flex-col items-center justify-center text-center">
                        <Users size={32} className="text-gov-navy/10 mb-2" />
                        <p className="text-sm font-medium text-gov-navy/40 italic">No registered voters found in this sector.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gov-navy/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="bg-gov-navy p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Initialize New Sector</h2>
                <button onClick={() => setShowModal(false)} className="font-mono text-gov-gold">CLOSE</button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Cluster</label>
                    <input 
                      required
                      value={clusterInput}
                      onChange={e => setClusterInput(e.target.value)}
                      className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                      placeholder="e.g. Cluster I"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Barangay</label>
                    <input 
                      required
                      value={barangayInput}
                      onChange={e => setBarangayInput(e.target.value)}
                      className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                      placeholder="e.g. Suarez"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Sector Designation</label>
                  <input 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                    placeholder="e.g. Precinct 0174A"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Location Intelligence</label>
                  <input 
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                    placeholder="Detailed address and logistical markers"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-gov-navy">Sector Visual Reference (URL)</label>
                  <input 
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full rounded-lg border border-gov-navy/10 bg-gov-bg p-3 text-sm font-bold text-gov-navy outline-none focus:border-gov-navy"
                    placeholder="Unsplash image URL or similar"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-lg border border-gov-navy/20 py-3 text-xs font-bold text-gov-navy hover:bg-gov-bg transition-colors"
                  >
                    Abort Protocol
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-gov-navy py-3 text-xs font-bold text-white shadow-md hover:bg-blue-900 transition-all"
                  >
                    {loading ? 'Initializing...' : (editingPrecinct ? 'Update Sector' : 'Commit Sector')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

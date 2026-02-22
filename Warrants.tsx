import React, { useState, useEffect } from "react";
import { Siren, Plus, Calendar, User, Shield, CheckCircle, XCircle, Clock } from "lucide-react";

export default function Warrants() {
  const [warrants, setWarrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ suspect_name: "", reason: "" });
  
  const currentUser = JSON.parse(localStorage.getItem("spvm_user") || "{}");
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchWarrants();
  }, []);

  const fetchWarrants = () => {
    fetch("/api/warrants", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur mandats");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setWarrants(data);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/warrants", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ suspect_name: "", reason: "" });
      fetchWarrants();
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/warrants/${id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      fetchWarrants();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approuvé': return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Approuvé</span>;
      case 'Refusé': return <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Refusé</span>;
      case 'Exécuté': return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Exécuté</span>;
      default: return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">En attente</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Mandats d'arrêt</h2>
          <p className="text-slate-400 text-sm">Gestion et approbation des mandats judiciaires.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Demander un mandat
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Chargement...</div>
        ) : warrants.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Siren className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun mandat d'arrêt en cours.</p>
          </div>
        ) : (
          warrants.map((warrant) => (
            <div key={warrant.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm hover:border-slate-600 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-500/10 p-2.5 rounded-lg mr-4">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{warrant.suspect_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(warrant.status)}
                      <span className="text-xs text-slate-500 font-mono">#{warrant.id}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {new Date(warrant.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Demandé par: {warrant.officer_name}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Motif de la demande</p>
                <p className="text-slate-300 text-sm leading-relaxed">{warrant.reason}</p>
              </div>

              {isAdmin && warrant.status === 'En attente' && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(warrant.id, 'Approuvé')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(warrant.id, 'Refusé')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Refuser
                  </button>
                </div>
              )}

              {warrant.status === 'Approuvé' && (
                <button 
                  onClick={() => handleUpdateStatus(warrant.id, 'Exécuté')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase transition-colors"
                >
                  <Clock className="w-4 h-4" />
                  Marquer comme exécuté
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">Demande de mandat</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nom du suspect</label>
                <input
                  type="text"
                  required
                  value={formData.suspect_name}
                  onChange={(e) => setFormData({ ...formData, suspect_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nom complet ou alias"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Motif détaillé</label>
                <textarea
                  required
                  rows={5}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Expliquez pourquoi ce mandat est nécessaire..."
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase transition-colors"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

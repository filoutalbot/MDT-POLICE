import React, { useState, useEffect } from "react";
import { AlertTriangle, Plus, Search, Calendar, User, Shield, DollarSign } from "lucide-react";

export default function Fines() {
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ citizen_name: "", amount: "", reason: "" });

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = () => {
    fetch("/api/fines", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur amendes");
        return res.json();
      })
      .then((data) => {
        setFines(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/fines", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify({ ...formData, amount: parseInt(formData.amount) }),
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ citizen_name: "", amount: "", reason: "" });
      fetchFines();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Rapports d'amendes</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle amende
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Chargement...</div>
        ) : fines.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun rapport d'amende enregistré.</p>
          </div>
        ) : (
          fines.map((fine) => (
            <div key={fine.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm hover:border-slate-600 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <div className="bg-yellow-500/10 p-2.5 rounded-lg mr-4">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{fine.citizen_name}</h3>
                    <p className="text-sm text-slate-400">Amende #{fine.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="text-xl font-bold text-emerald-400">{fine.amount}$</div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    {new Date(fine.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-slate-500" />
                    {fine.officer_name} ({fine.badge_number})
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Motif</p>
                <p className="text-slate-200">{fine.reason}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Nouvelle amende</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom du citoyen</label>
                <input
                  type="text"
                  required
                  value={formData.citizen_name}
                  onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Montant ($)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Motif de l'amende</label>
                <textarea
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

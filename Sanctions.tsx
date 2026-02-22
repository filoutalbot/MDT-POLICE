import React, { useState, useEffect } from "react";
import { Gavel, Plus, Calendar, User, Shield, AlertCircle } from "lucide-react";

export default function Sanctions() {
  const [sanctions, setSanctions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ officer_id: "", reason: "" });
  const currentUser = JSON.parse(localStorage.getItem("spvm_user") || "{}");

  useEffect(() => {
    fetchSanctions();
    fetchMembers();
  }, []);

  const fetchSanctions = () => {
    fetch("/api/sanctions", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSanctions(data);
        setLoading(false);
      });
  };

  const fetchMembers = () => {
    fetch("/api/members", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/sanctions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify({ ...formData, officer_id: parseInt(formData.officer_id) }),
    });

    if (res.ok) {
      setShowModal(false);
      setFormData({ officer_id: "", reason: "" });
      fetchSanctions();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Historique des Sanctions</h2>
        {currentUser.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Émettre une sanction
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Chargement...</div>
        ) : sanctions.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <Gavel className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune sanction enregistrée.</p>
          </div>
        ) : (
          sanctions.map((sanction) => (
            <div key={sanction.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <div className="bg-red-500/10 p-2.5 rounded-lg mr-4">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{sanction.officer_name}</h3>
                    <p className="text-sm text-slate-400">Matricule: {sanction.officer_badge}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-slate-400">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    {new Date(sanction.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Émis par: {sanction.issuer_name} ({sanction.issuer_badge})
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Motif de la sanction</p>
                <p className="text-slate-200 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 italic">"{sanction.reason}"</p>
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
              <h3 className="text-lg font-bold text-white">Émettre une sanction</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Officier sanctionné</label>
                <select
                  required
                  value={formData.officer_id}
                  onChange={(e) => setFormData({ ...formData, officer_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Sélectionner un membre</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.full_name} ({m.badge_number})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Motif</label>
                <textarea
                  required
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Expliquez la raison de cette sanction..."
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
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Confirmer la sanction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Award, Plus, Edit2, Trash2, X, Check } from "lucide-react";

export default function Ranks() {
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRank, setEditingRank] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", responsibilities: "" });
  
  const currentUser = JSON.parse(localStorage.getItem("spvm_user") || "{}");
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchRanks();
  }, []);

  const fetchRanks = () => {
    setLoading(true);
    fetch("/api/ranks", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRanks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOpenModal = (rank: any = null) => {
    if (rank) {
      setEditingRank(rank);
      setFormData({
        name: rank.name,
        responsibilities: rank.responsibilities
      });
    } else {
      setEditingRank(null);
      setFormData({ name: "", responsibilities: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRank ? `/api/ranks/${editingRank.id}` : "/api/ranks";
    const method = editingRank ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      fetchRanks();
    } else {
      const data = await res.json().catch(() => ({ error: "Erreur serveur" }));
      alert(data.error || "Une erreur est survenue.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce grade ?")) return;
    const res = await fetch(`/api/ranks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    });
    if (res.ok) fetchRanks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Grades & Responsabilités</h2>
          <p className="text-slate-400 text-sm">Hiérarchie et attributions du personnel.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un grade
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Chargement...</div>
        ) : (
          ranks.map((rank) => (
            <div key={rank.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm hover:border-blue-500/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-blue-500" />
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(rank)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(rank.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 group-hover:text-blue-400 transition-colors">{rank.name}</h3>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Responsabilités</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {rank.responsibilities}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                {editingRank ? "Modifier le grade" : "Nouveau grade"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nom du grade</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Sergent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Responsabilités</label>
                <textarea
                  required
                  rows={4}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Décrivez les attributions liées à ce grade..."
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
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs uppercase transition-colors flex items-center justify-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {editingRank ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { BookOpen, Search, Plus, Edit2, Trash2, X, AlertCircle, Check } from "lucide-react";

export default function PenalCode() {
  const [penalCode, setPenalCode] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [formData, setFormData] = useState({ article: "", description: "", fine_amount: "", jail_time: "" });
  
  const currentUser = JSON.parse(localStorage.getItem("spvm_user") || "{}");
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchPenalCode();
  }, []);

  const fetchPenalCode = () => {
    setLoading(true);
    fetch("/api/penal_code", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPenalCode(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleOpenModal = (article: any = null) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        article: article.article,
        description: article.description,
        fine_amount: article.fine_amount.toString(),
        jail_time: article.jail_time.toString()
      });
    } else {
      setEditingArticle(null);
      setFormData({ article: "", description: "", fine_amount: "", jail_time: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingArticle ? `/api/penal_code/${editingArticle.id}` : "/api/penal_code";
    const method = editingArticle ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify({
        ...formData,
        fine_amount: parseInt(formData.fine_amount),
        jail_time: parseInt(formData.jail_time)
      }),
    });

    if (res.ok) {
      setShowModal(false);
      fetchPenalCode();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet article ?")) return;
    const res = await fetch(`/api/penal_code/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    });
    if (res.ok) fetchPenalCode();
  };

  const filteredCode = penalCode.filter(
    (item) =>
      item.article?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Code Pénal</h2>
          <p className="text-slate-400 text-sm">Référentiel des infractions et sanctions.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Article</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Amende</th>
                <th className="px-6 py-4 font-semibold">Peine (jours)</th>
                {isAdmin && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : filteredCode.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-slate-500">Aucun article trouvé.</td>
                </tr>
              ) : (
                filteredCode.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-blue-400 font-bold uppercase">{item.article}</td>
                    <td className="px-6 py-4 text-white font-medium">{item.description}</td>
                    <td className="px-6 py-4 text-emerald-400 font-black">{item.fine_amount}$</td>
                    <td className="px-6 py-4 text-red-400 font-black">{item.jail_time} j</td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(item)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter">
                {editingArticle ? "Modifier l'article" : "Nouvel article"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nom de l'article</label>
                <input
                  type="text"
                  required
                  value={formData.article}
                  onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Art. 1 - Vol"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amende ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.fine_amount}
                    onChange={(e) => setFormData({ ...formData, fine_amount: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Prison (jours)</label>
                  <input
                    type="number"
                    required
                    value={formData.jail_time}
                    onChange={(e) => setFormData({ ...formData, jail_time: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
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
                  {editingArticle ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

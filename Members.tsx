import React, { useState, useEffect } from "react";
import { Search, UserPlus, Edit2, Trash2, X, Shield, Check, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    badge_number: "",
    rank_id: "",
    role: "officer",
    status: "active"
  });

  const currentUser = JSON.parse(localStorage.getItem("spvm_user") || "{}");
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchMembers();
    fetchRanks();
  }, []);

  const fetchMembers = () => {
    setLoading(true);
    fetch("/api/members", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur membres");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchRanks = () => {
    fetch("/api/ranks", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur grades");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRanks(data);
        }
      })
      .catch(err => console.error(err));
  };

  const handleOpenModal = (member: any = null) => {
    setError("");
    if (member) {
      setEditingMember(member);
      setFormData({
        username: member.username || "",
        password: "", // Don't show password
        full_name: member.full_name || "",
        badge_number: member.badge_number || "",
        rank_id: member.rank_id?.toString() || "",
        role: member.role || "officer",
        status: member.status || "active"
      });
    } else {
      setEditingMember(null);
      setFormData({
        username: "",
        password: "",
        full_name: "",
        badge_number: "",
        rank_id: "",
        role: "officer",
        status: "active"
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editingMember ? `/api/members/${editingMember.id}` : "/api/members";
    const method = editingMember ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify({
        ...formData,
        rank_id: parseInt(formData.rank_id)
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setShowModal(false);
      fetchMembers();
    } else {
      const data = await res.json().catch(() => ({ error: "Erreur serveur" }));
      setError(data.error || "Une erreur est survenue.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;

    const res = await fetch(`/api/members/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    });

    if (res.ok) {
      fetchMembers();
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de la suppression.");
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.badge_number?.includes(search) ||
      m.rank_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Gestion des Membres</h2>
          <p className="text-slate-400 text-sm mt-1">Consultez et gérez le personnel du SPVM.</p>
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
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 mr-2" />
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
                <th className="px-6 py-4 font-semibold">Matricule</th>
                <th className="px-6 py-4 font-semibold">Nom complet</th>
                <th className="px-6 py-4 font-semibold">Grade</th>
                <th className="px-6 py-4 font-semibold">Rôle</th>
                <th className="px-6 py-4 font-semibold">Statut</th>
                {isAdmin && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-slate-500">Chargement...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-slate-500">Aucun membre trouvé.</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-blue-400">{member.badge_number}</td>
                    <td className="px-6 py-4 font-medium text-white">{member.full_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                        {member.rank_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 capitalize">{member.role}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        member.status === 'active' 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {member.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(member)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            disabled={member.id === currentUser.id}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Supprimer"
                          >
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
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-bold text-white">
                  {editingMember ? "Modifier le membre" : "Ajouter un nouveau membre"}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom d'utilisateur</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingMember}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                  />
                </div>
                {!editingMember && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mot de passe</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Matricule</label>
                  <input
                    type="text"
                    required
                    value={formData.badge_number}
                    onChange={(e) => setFormData({ ...formData, badge_number: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Grade</label>
                  <select
                    required
                    value={formData.rank_id}
                    onChange={(e) => setFormData({ ...formData, rank_id: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Sélectionner</option>
                    {ranks.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Rôle Système</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="officer">Officier</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Statut</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center"
                >
                  {editingMember ? <Check className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {editingMember ? "Enregistrer" : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

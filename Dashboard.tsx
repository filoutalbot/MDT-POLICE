import React, { useState, useEffect } from "react";
import { Shield, Users, FileText, AlertTriangle, Siren, Radio, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("spvm_user") || "{}");
  const [stats, setStats] = useState<any[]>([]);
  const [pendingWarrants, setPendingWarrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` };
        
        const [membersRes, warrantsRes] = await Promise.all([
          fetch("/api/members", { headers }),
          fetch("/api/warrants", { headers })
        ]);

        if (!membersRes.ok || !warrantsRes.ok) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const members = await membersRes.json();
        const warrants = await warrantsRes.json();

        setStats([
          { name: "Membres Actifs", value: members.length.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { name: "Mandats en attente", value: warrants.filter((w: any) => w.status === 'En attente').length.toString(), icon: FileText, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { name: "Plaintes", value: "0", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ]);

        setPendingWarrants(warrants.filter((w: any) => w.status === 'En attente').slice(0, 3));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    
    window.addEventListener('spvm_refresh_data', fetchData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('spvm_refresh_data', fetchData);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bienvenue, {user.full_name}</h2>
          <p className="text-slate-400 font-medium">Matricule: <span className="text-blue-500">#{user.badge_number}</span> | Rôle: <span className="capitalize">{user.role}</span></p>
        </div>
        <div className="bg-slate-800 px-6 py-3 rounded-2xl border border-slate-700 flex items-center shadow-2xl">
          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse" />
          <span className="text-sm font-black text-white uppercase tracking-widest">Système Opérationnel</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm transition-all hover:border-slate-600 group">
            <div className="flex items-center">
              <div className={`${stat.bg} p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.name}</p>
                <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Warrants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
                <FileText className="w-4 h-4 mr-2 text-yellow-500" />
                Derniers mandats en attente
              </h3>
            </div>
            <div className="p-6">
              {pendingWarrants.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic text-sm">Aucun mandat en attente d'approbation.</div>
              ) : (
                <div className="space-y-4">
                  {pendingWarrants.map((warrant) => (
                    <div key={warrant.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{warrant.suspect_name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{warrant.reason}</p>
                      </div>
                      <Link 
                        to="/mandats" 
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase transition-colors"
                      >
                        Voir
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Actions Rapides</h3>
            </div>
            <div className="p-6 grid grid-cols-1 gap-3">
              <Link to="/arrestations" className="flex items-center p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-blue-500 transition-all group">
                <div className="bg-blue-500/10 p-2 rounded-lg mr-4 group-hover:bg-blue-500/20">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nouveau Rapport</span>
              </Link>
              <Link to="/amendes" className="flex items-center p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-yellow-500 transition-all group">
                <div className="bg-yellow-500/10 p-2 rounded-lg mr-4 group-hover:bg-yellow-500/20">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nouvelle Amende</span>
              </Link>
              <Link to="/mandats" className="flex items-center p-4 bg-slate-900 rounded-xl border border-slate-700 hover:border-red-500 transition-all group">
                <div className="bg-red-500/10 p-2 rounded-lg mr-4 group-hover:bg-red-500/20">
                  <Siren className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Demander Mandat</span>
              </Link>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden">
            <Shield className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-500/20" />
            <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Code de Conduite</h4>
            <p className="text-blue-100 text-xs leading-relaxed opacity-90">
              Servir et protéger avec intégrité. Respectez la hiérarchie et les procédures opérationnelles en tout temps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

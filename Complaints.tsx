import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar, User, CheckCircle, Clock } from "lucide-react";

export default function Complaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    fetch("/api/complaints", {
      headers: { Authorization: `Bearer ${localStorage.getItem("spvm_token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComplaints(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white tracking-tight">Plaintes Citoyennes</h2>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Chargement...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune plainte enregistrée.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center">
                  <div className="bg-blue-500/10 p-2.5 rounded-lg mr-4">
                    <User className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{complaint.citizen_name}</h3>
                    <p className="text-sm text-slate-400">Plainte #{complaint.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center text-slate-400">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    {new Date(complaint.date).toLocaleDateString()}
                  </div>
                  <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    complaint.status === 'En attente' 
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50'
                  }`}>
                    {complaint.status === 'En attente' ? <Clock className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                    {complaint.status}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Officier concerné</p>
                  <p className="text-slate-200 font-medium">{complaint.officer_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description des faits</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{complaint.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

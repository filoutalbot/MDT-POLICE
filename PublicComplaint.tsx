import React, { useState } from "react";
import { Shield, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicComplaint() {
  const [formData, setFormData] = useState({ citizen_name: "", officer_name: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Plainte reçue</h2>
          <p className="text-slate-400 mb-8">
            Votre plainte a été enregistrée avec succès. Elle sera examinée par nos services dans les plus brefs délais.
          </p>
          <Link 
            to="/login" 
            className="inline-block w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 flex items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/fr/thumb/3/3d/Logo_SPVM.svg/1200px-Logo_SPVM.svg.png" 
            alt="SPVM Logo" 
            className="w-12 h-12 mr-4 object-contain brightness-0 invert"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter">SPVM - Formulaire de Plainte</h2>
            <p className="text-blue-100 text-sm">Portail citoyen officiel</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <p className="text-slate-400 text-sm leading-relaxed">
            Ce formulaire permet aux citoyens de signaler un comportement inapproprié ou de déposer une plainte officielle concernant un officier du SPVM. Toutes les informations resteront confidentielles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Votre nom complet</label>
              <input
                type="text"
                required
                value={formData.citizen_name}
                onChange={(e) => setFormData({ ...formData, citizen_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom de l'officier concerné</label>
              <input
                type="text"
                required
                value={formData.officer_name}
                onChange={(e) => setFormData({ ...formData, officer_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nom ou Matricule"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description détaillée des faits</label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Veuillez décrire l'incident avec le plus de précisions possible (date, lieu, circonstances)..."
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link to="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Accès restreint (MDT)
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : (
                <>
                  Envoyer la plainte
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <p className="mt-8 text-slate-600 text-xs text-center max-w-md">
        En soumettant ce formulaire, vous certifiez que les informations fournies sont exactes. Toute fausse déclaration peut entraîner des poursuites judiciaires.
      </p>
    </div>
  );
}

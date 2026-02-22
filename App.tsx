import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Ranks from "./pages/Ranks";
import PenalCode from "./pages/PenalCode";
import Arrests from "./pages/Arrests";
import Fines from "./pages/Fines";
import Complaints from "./pages/Complaints";
import Sanctions from "./pages/Sanctions";
import Warrants from "./pages/Warrants";
import PublicComplaint from "./pages/PublicComplaint";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("spvm_token");
      if (token) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to initialize app:", e);
      setError("Erreur lors de l'initialisation de l'application.");
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-red-500 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Erreur Critique</h1>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 animate-pulse">Initialisation du système SPVM...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" />} />
        <Route path="/plainte-citoyenne" element={<PublicComplaint />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <Layout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="membres" element={<Members />} />
          <Route path="grades" element={<Ranks />} />
          <Route path="code-penal" element={<PenalCode />} />
          <Route path="mandats" element={<Warrants />} />
          <Route path="arrestations" element={<Arrests />} />
          <Route path="amendes" element={<Fines />} />
          <Route path="plaintes" element={<Complaints />} />
          <Route path="sanctions" element={<Sanctions />} />
        </Route>
      </Routes>
    </Router>
  );
}

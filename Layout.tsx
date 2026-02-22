import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Users, 
  Award, 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  MessageSquare, 
  Gavel, 
  LogOut,
  LayoutDashboard,
  Radio,
  Bell,
  Siren,
  MapPin
} from "lucide-react";
import { cn } from "../lib/utils";

export default function Layout({ setIsAuthenticated }: { setIsAuthenticated: (val: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dutyStatus, setDutyStatus] = React.useState("Indisponible");
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);

  const currentUser = JSON.parse(localStorage.getItem("spvm_user") || "{}");

  const handleStatusChange = (status: string) => {
    fetch("/api/users/duty_status", {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("spvm_token")}`
      },
      body: JSON.stringify({ duty_status: status }),
    }).then(() => {
      setDutyStatus(status);
      setShowStatusMenu(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("spvm_token");
    localStorage.removeItem("spvm_user");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const navItems = [
    { name: "Tableau de bord", path: "/", icon: LayoutDashboard },
    { name: "Membres", path: "/membres", icon: Users },
    { name: "Grades & Resp.", path: "/grades", icon: Award },
    { name: "Code Pénal", path: "/code-penal", icon: BookOpen },
    { name: "Mandats d'arrêt", path: "/mandats", icon: Siren },
    { name: "Rapports d'arrestation", path: "/arrestations", icon: FileText },
    { name: "Rapports d'amendes", path: "/amendes", icon: AlertTriangle },
    { name: "Plaintes", path: "/plaintes", icon: MessageSquare },
    { name: "Sanctions", path: "/sanctions", icon: Gavel },
  ];

  const statusOptions = [
    { name: "Disponible", color: "bg-emerald-500" },
    { name: "Indisponible", color: "bg-slate-500" },
    { name: "En Patrouille", color: "bg-blue-500" },
    { name: "Contrôle Routier", color: "bg-yellow-500" },
    { name: "En Direction", color: "bg-purple-500" },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <img 
            src="https://upload.wikimedia.org/wikipedia/fr/thumb/3/3d/Logo_SPVM.svg/1200px-Logo_SPVM.svg.png" 
            alt="SPVM Logo" 
            className="w-10 h-10 mr-3 object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-2xl font-black tracking-tighter text-white">SPVM</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-600/10 text-blue-400" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-blue-400" : "text-slate-500")} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-500 group-hover:text-red-400" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-[9999]">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-white uppercase tracking-tighter">
              {navItems.find(item => item.path === location.pathname)?.name || "MDT"}
            </h1>
            
            {/* Status Selector */}
            <div className="relative z-[10000]">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-700 transition-colors"
              >
                <div className={cn("w-2.5 h-2.5 rounded-full", statusOptions.find(o => o.name === dutyStatus)?.color || "bg-slate-500")} />
                <span className="text-sm font-bold text-slate-200">{dutyStatus}</span>
              </button>
              
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[10001] overflow-hidden">
                  {statusOptions.map(option => (
                    <button
                      key={option.name}
                      onClick={() => handleStatusChange(option.name)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                    >
                      <div className={cn("w-2 h-2 rounded-full", option.color)} />
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6 relative z-[10000]">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Officier</div>
              <div className="text-sm text-white font-black tracking-tight">
                {currentUser.full_name} <span className="text-blue-500">#{currentUser.badge_number}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

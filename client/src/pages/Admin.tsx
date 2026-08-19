import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, ShieldAlert, Check, X, Shield, LayoutDashboard, Users, Home, LogOut, TrendingUp, Award, Zap, Activity } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useContext();
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery();
  
  const deleteMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
  });
  
  const updateMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => utils.admin.getUsers.invalidate(),
  });

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [editName, setEditName] = useState("");

  const startEdit = (u: any) => {
    setEditingUserId(u.id);
    setEditRole(u.role);
    setEditName(u.name || "");
  };

  const saveEdit = (id: number) => {
    updateMutation.mutate({ userId: id, role: editRole, name: editName });
    setEditingUserId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur et toutes ses données ? Cette action est irréversible.")) {
      deleteMutation.mutate({ userId: id });
    }
  };

  const handleLogout = () => {
    setLocation("/");
    logout();
  };

  const totalUsers = users?.length || 0;
  const totalLevels = users?.reduce((acc, u) => acc + u.level, 0) || 0;
  const totalXp = users?.reduce((acc, u) => acc + u.xp, 0) || 0;
  const avgLevel = totalUsers > 0 ? (totalLevels / totalUsers).toFixed(1) : "0";

  if (isLoading) return <div className="app-shell flex items-center justify-center min-h-screen">Chargement du panneau admin...</div>;

  return (
    <div className="app-shell flex h-screen overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 border-r flex flex-col justify-between py-6" style={{ borderColor: 'var(--glass-line)', background: 'rgba(8, 22, 41, 0.4)', backdropFilter: 'blur(20px)' }}>
        <div>
          <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-10" style={{ color: 'var(--glass-coral)' }}>
            <ShieldAlert size={28} />
            <span className="hidden lg:block ml-3 font-bold text-xl tracking-wide font-display">TECHNOVA</span>
          </div>
          
          <nav className="flex flex-col gap-2 px-2 lg:px-4">
            <button onClick={() => setLocation("/")} className="flex items-center p-3 rounded-xl hover:bg-white/5 opacity-70 hover:opacity-100 transition-all group">
              <Home size={20} className="mx-auto lg:mx-0 group-hover:text-[var(--glass-coral)]" />
              <span className="hidden lg:block ml-3 font-medium">Accueil</span>
            </button>
            <button className="flex items-center p-3 rounded-xl transition-all border shadow-[0_0_15px_rgba(255,138,114,0.15)]" style={{ backgroundColor: 'rgba(255, 138, 114, 0.1)', borderColor: 'rgba(255, 138, 114, 0.2)', color: 'var(--glass-coral)' }}>
              <LayoutDashboard size={20} className="mx-auto lg:mx-0" />
              <span className="hidden lg:block ml-3 font-medium">Vue d'ensemble</span>
            </button>
            <button className="flex items-center p-3 rounded-xl hover:bg-white/5 opacity-70 hover:opacity-100 transition-all group">
              <Users size={20} className="mx-auto lg:mx-0 group-hover:text-[var(--glass-coral)]" />
              <span className="hidden lg:block ml-3 font-medium">Utilisateurs</span>
            </button>
          </nav>
        </div>
        
        <div className="px-2 lg:px-4">
          <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl hover:bg-red-500/10 opacity-70 hover:opacity-100 hover:text-red-400 transition-all group">
            <LogOut size={20} className="mx-auto lg:mx-0" />
            <span className="hidden lg:block ml-3 font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-6 lg:p-10 relative">
        <header className="flex justify-between items-center mb-10 z-10">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight" style={{ color: 'var(--glass-text)' }}>Vue d'ensemble</h1>
            <p className="mt-1" style={{ color: 'var(--glass-muted)' }}>Gérez vos joueurs et suivez les statistiques.</p>
          </div>
          <div className="flex items-center gap-4 border p-2 pr-4 rounded-full backdrop-blur-md" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg text-white" style={{ background: 'linear-gradient(135deg, var(--glass-coral), #ff9a7e)' }}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-bold leading-tight">{user?.name || 'Administrateur'}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--glass-muted)' }}>Admin</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 z-10">
          {/* Card 1 */}
          <div className="border p-6 rounded-3xl relative overflow-hidden group transition-all shadow-xl" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-all" style={{ backgroundColor: 'rgba(255, 138, 114, 0.05)' }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--glass-muted)' }}>Total Utilisateurs</p>
                <h3 className="text-4xl font-bold font-display tracking-tight">{totalUsers}</h3>
              </div>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255, 138, 114, 0.1)', color: 'var(--glass-coral)' }}>
                <Users size={24} />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold w-fit px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--glass-text)' }}>
              <TrendingUp size={14} className="mr-1.5" style={{ color: 'var(--glass-coral)' }} /> En croissance
            </div>
          </div>

          {/* Card 2 */}
          <div className="border p-6 rounded-3xl relative overflow-hidden group transition-all shadow-xl" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-all" style={{ backgroundColor: 'rgba(255, 138, 114, 0.05)' }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--glass-muted)' }}>Niveaux Atteints</p>
                <h3 className="text-4xl font-bold font-display tracking-tight">{totalLevels}</h3>
              </div>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255, 138, 114, 0.1)', color: 'var(--glass-coral)' }}>
                <Award size={24} />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium" style={{ color: 'var(--glass-muted)' }}>
              Cumul de tous les joueurs
            </div>
          </div>

          {/* Card 3 */}
          <div className="border p-6 rounded-3xl relative overflow-hidden group transition-all shadow-xl" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-all" style={{ backgroundColor: 'rgba(255, 138, 114, 0.05)' }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--glass-muted)' }}>XP Global</p>
                <h3 className="text-4xl font-bold font-display tracking-tight">{totalXp.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255, 138, 114, 0.1)', color: 'var(--glass-coral)' }}>
                <Zap size={24} />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium" style={{ color: 'var(--glass-muted)' }}>
              Points générés sur le site
            </div>
          </div>

          {/* Card 4 */}
          <div className="border p-6 rounded-3xl relative overflow-hidden group transition-all shadow-xl" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl transition-all" style={{ backgroundColor: 'rgba(255, 138, 114, 0.05)' }} />
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--glass-muted)' }}>Niveau Moyen</p>
                <h3 className="text-4xl font-bold font-display tracking-tight">{avgLevel}</h3>
              </div>
              <div className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(255, 138, 114, 0.1)', color: 'var(--glass-coral)' }}>
                <Activity size={24} />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium" style={{ color: 'var(--glass-muted)' }}>
              Sur la base des actifs
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 z-10 flex-1">
          {/* Table Container */}
          <div className="xl:col-span-2 border rounded-3xl flex flex-col shadow-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--glass-line)', backdropFilter: 'blur(20px)' }}>
            <div className="px-8 py-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--glass-line)', backgroundColor: 'var(--glass-soft)' }}>
              <h2 className="text-xl font-bold font-display">Liste des Joueurs</h2>
            </div>
            <div className="overflow-x-auto flex-1 p-2">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="text-xs uppercase font-bold tracking-widest" style={{ color: 'var(--glass-muted)' }}>
                  <tr>
                    <th className="px-6 py-4">Nom</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">Statistiques</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users?.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors rounded-xl group">
                      <td className="px-6 py-4 rounded-l-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold border shadow-inner opacity-80" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)' }}>
                            {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            {editingUserId === u.id ? (
                              <input 
                                type="text" 
                                value={editName} 
                                onChange={e => setEditName(e.target.value)}
                                className="border px-3 py-1.5 rounded-lg w-40 outline-none"
                                style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-coral)', color: 'var(--glass-text)' }}
                              />
                            ) : (
                              <p className="font-bold text-base">{u.name || "-"}</p>
                            )}
                            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--glass-muted)' }}>{u.email || "Compte Local"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingUserId === u.id ? (
                          <select 
                            value={editRole} 
                            onChange={e => setEditRole(e.target.value as any)}
                            className="border px-3 py-1.5 rounded-lg outline-none"
                            style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-coral)', color: 'var(--glass-text)' }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'shadow-[0_0_10px_rgba(255,138,114,0.1)]' : 'border'}`} style={{ 
                            backgroundColor: u.role === 'admin' ? 'rgba(255, 138, 114, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            color: u.role === 'admin' ? 'var(--glass-coral)' : 'var(--glass-text)',
                            borderColor: u.role === 'admin' ? 'rgba(255, 138, 114, 0.2)' : 'var(--glass-line)'
                          }}>
                            {u.role === 'admin' && <Shield size={12} />}
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="font-bold" style={{ color: 'var(--glass-coral)' }}>Niv {u.level}</p>
                          <p className="text-xs font-semibold" style={{ color: 'var(--glass-muted)' }}>{u.xp} XP</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right rounded-r-xl">
                        {editingUserId === u.id ? (
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => saveEdit(u.id)} disabled={updateMutation.isPending} className="h-10 w-10" style={{ backgroundColor: 'rgba(255, 138, 114, 0.1)', color: 'var(--glass-coral)' }}>
                              <Check size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingUserId(null)} className="h-10 w-10 hover:bg-white/10 opacity-70">
                              <X size={18} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(u)} className="h-10 w-10 hover:bg-white/10 opacity-70 hover:opacity-100 transition-all bg-white/5">
                              <Edit2 size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} disabled={user?.id === u.id || deleteMutation.isPending} className={`h-10 w-10 transition-all ${user?.id === u.id ? 'opacity-20' : 'bg-white/5 hover:bg-red-500/20 opacity-70 hover:opacity-100 hover:text-red-400'}`}>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Banner Card (The "Earn free crypto" equivalent) */}
          <div className="border rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-2xl h-full min-h-[350px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'var(--glass-line)', backdropFilter: 'blur(20px)' }}>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            {/* Decorative Orbs */}
            <div className="absolute -right-24 -bottom-24 w-72 h-72 border rounded-full" style={{ borderColor: 'var(--glass-line)' }} />
            <div className="absolute -right-12 -bottom-12 w-48 h-48 border rounded-full" style={{ borderColor: 'var(--glass-line)' }} />
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none" style={{ background: 'linear-gradient(to bottom left, rgba(255, 138, 114, 0.08), transparent)' }} />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-fit p-3 rounded-2xl mb-6 backdrop-blur-md border" style={{ backgroundColor: 'var(--glass-soft)', borderColor: 'var(--glass-line)' }}>
                <Zap size={24} style={{ color: 'var(--glass-coral)' }} />
              </div>
              
              <h2 className="text-3xl font-bold font-display mb-4 leading-tight">
                Gérez l'arène<br/>
                <span style={{ color: 'var(--glass-coral)' }}>Technova.</span>
              </h2>
              <p className="mb-8 text-sm leading-relaxed max-w-[250px]" style={{ color: 'var(--glass-muted)' }}>
                Modifiez les profils, promouvez des modérateurs et surveillez l'engagement des joueurs en temps réel.
              </p>
              
              <div className="mt-auto">
                <Button onClick={() => window.open('mailto:support@technovalearning.com')} className="w-full text-white hover:opacity-90 rounded-2xl px-8 py-7 font-bold text-base shadow-[0_0_30px_rgba(255,138,114,0.3)] transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #ff725d, #ff9a7e)' }}>
                  Contacter le Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

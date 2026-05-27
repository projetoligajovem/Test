import { Search, Home, MessageSquare, Users, Award, Settings, LogOut, Bell, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface SidebarProps {
  profile: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ profile, activeTab, setActiveTab, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const menuItems = [
    { id: 'feed', icon: Home, label: 'Início', path: '/dashboard' },
    { id: 'messages', icon: MessageSquare, label: 'Sessões', path: '/dashboard' },
    { id: 'ranking', icon: Award, label: 'Ranking', path: '/dashboard' },
    { id: 'settings', icon: Settings, label: 'Ajustes', path: '/dashboard' },
  ];

  const handleNav = (item: any) => {
    setActiveTab(item.id);
    if (onClose) onClose();
    navigate(item.path);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed left-0 top-0 bottom-0 w-72 bg-dark-bg border-r border-white/5 p-8 flex flex-col z-50 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Close button for mobile */}
        <button 
          onClick={onClose}
          className="md:hidden absolute top-6 right-6 w-10 h-10 glass rounded-xl flex items-center justify-center"
        >
          <LogOut className="w-5 h-5 rotate-180" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 md:mb-12">
          <div className="w-10 h-10 rounded-xl bg-neon-blue neon-glow flex items-center justify-center">
            <span className="text-dark-bg font-bold text-xl">P</span>
          </div>
          <span className="text-2xl font-display font-bold tracking-tight">Ponte</span>
        </div>

        {/* Profile Summary */}
        <div 
          className="glass p-6 rounded-3xl mb-8 md:mb-10 group cursor-pointer hover:border-neon-blue/30 transition-all" 
          onClick={() => {
            navigate(`/profile/${profile?.uid}`);
            if (onClose) onClose();
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue to-purple-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {profile?.displayName[0]}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm truncate">{profile?.displayName}</h4>
              <span className="text-xs text-neon-blue font-bold tracking-widest uppercase">Nível {profile?.level}</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neon-blue neon-glow transition-all duration-1000" 
              style={{ width: `${(profile?.xp || 0) % 100}%` }} 
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
            <span>{profile?.xp} XP Total</span>
            <span>Prox. Nível</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2 flex-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className={cn(
                "w-full h-14 rounded-2xl flex items-center gap-4 px-6 transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20" 
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", activeTab === item.id ? "neon-glow" : "")} />
              <span className="font-bold whitespace-nowrap">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue neon-glow" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="mt-6 md:mt-auto h-14 rounded-2xl flex items-center gap-4 px-6 text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">Sair</span>
        </button>
      </aside>
    </>
  );
}

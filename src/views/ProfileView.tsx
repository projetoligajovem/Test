import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Award, 
  ChevronLeft, 
  Zap, 
  Users, 
  Clock, 
  MapPin, 
  Star,
  BookOpen,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Mail,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface ProfileViewProps {
  user: any;
  profile: UserProfile | null;
}

export default function ProfileView({ user, profile: currentProfile }: ProfileViewProps) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      setLoading(true);
      const pDoc = await getDoc(doc(db, 'users', userId));
      if (pDoc.exists()) {
        setProfile(pDoc.data() as UserProfile);
      }
      setLoading(false);
    };
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin neon-glow"></div>
      </div>
    );
  }

  if (!profile) return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-gray-500 font-bold">Usuário não encontrado.</div>;

  const isOwnProfile = user.uid === userId;

  return (
    <div className="min-h-screen bg-dark-bg pb-20 px-4 md:px-6 overflow-x-hidden">
      <nav className="fixed top-0 left-0 w-full h-16 md:h-20 glass border-b border-white/5 z-50 px-4 md:px-8 flex items-center gap-4 md:gap-6">
        <button onClick={() => navigate('/dashboard')} className="w-9 h-9 md:w-10 md:h-10 glass rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white/10 transition-all text-gray-400">
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <h2 className="font-display font-bold text-sm md:text-xl uppercase tracking-tighter truncate">Perfil do {isOwnProfile ? 'Estudante' : 'Membro'}</h2>
      </nav>

      <div className="max-w-6xl mx-auto mt-24 md:mt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column: Brief & Stats */}
          <div className="space-y-6 md:space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-8 md:p-10 rounded-[32px] md:rounded-[48px] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 hidden md:block">
                <ShieldCheck className="w-20 h-20 text-neon-blue" />
              </div>
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-neon-blue to-purple-500 flex items-center justify-center text-3xl md:text-4xl font-bold mx-auto mb-6 relative">
                {profile.photoURL ? <img src={profile.photoURL} className="w-full h-full object-cover rounded-[30px] md:rounded-[38px]" alt="" /> : profile.displayName[0]}
                <div className="absolute -bottom-2 -right-2 w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-dark-bg border-4 border-dark-bg flex items-center justify-center">
                  <div className="w-full h-full rounded-lg md:rounded-xl bg-neon-blue neon-glow flex items-center justify-center text-[9px] md:text-[10px] text-dark-bg font-extrabold">
                    Lvl {profile.level}
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-2 break-words">{profile.displayName}</h1>
              <p className="text-sm md:text-base text-gray-500 font-medium mb-8 flex items-center justify-center gap-2">
                <GraduationCap className="w-4 h-4 flex-shrink-0" /> {profile.school} • {profile.grade}
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="p-4 md:p-6 glass rounded-2xl md:rounded-3xl">
                  <div className="text-xl md:text-2xl font-display font-bold text-neon-blue mb-1">{profile.peopleHelpedCount}</div>
                  <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ajudados</div>
                </div>
                <div className="p-4 md:p-6 glass rounded-2xl md:rounded-3xl">
                  <div className="text-xl md:text-2xl font-display font-bold text-purple-400 mb-1">{profile.reputation}</div>
                  <div className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Reputação</div>
                </div>
              </div>
            </motion.div>

            <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px]">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neon-blue" /> Progresso de XP
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] md:text-xs font-bold mb-2">
                  <span className="text-gray-400 uppercase">Nível {profile.level}</span>
                  <span className="text-neon-blue uppercase">Nível {profile.level + 1}</span>
                </div>
                <div className="h-3 md:h-4 w-full bg-white/5 rounded-full p-0.5 md:p-1 overflow-hidden">
                  <div 
                    className="h-full bg-neon-blue rounded-full neon-glow transition-all duration-1000" 
                    style={{ width: `${profile.xp % 100}%` }}
                  />
                </div>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium text-center">Faltam {100 - (profile.xp % 100)} XP para o nível {profile.level + 1}.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & History */}
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            {/* Subjects Chips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px]"
              >
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-neon-blue mb-6 border-b border-neon-blue/10 pb-4">Domina</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjectsExpert.map(s => (
                    <span key={s} className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-neon-blue/10 text-neon-blue text-[10px] md:text-xs font-bold border border-neon-blue/20">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px]"
              >
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-purple-400 mb-6 border-b border-purple-400/10 pb-4">Estuda</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjectsLearning.map(s => (
                    <span key={s} className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-purple-500/10 text-purple-400 text-[10px] md:text-xs font-bold border border-purple-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Badges & Achievements */}
            <div className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px]">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">Conquistas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                {[
                  { icon: <Zap className="w-5 h-5 md:w-6 md:h-6" />, name: 'Primeiro Passo', desc: '1 ajuda completa' },
                  { icon: <Users className="w-5 h-5 md:w-6 md:h-6" />, name: 'Colaborador', desc: 'Ajudou 10 pessoas' },
                  { icon: <Star className="w-5 h-5 md:w-6 md:h-6" />, name: 'Mestre', desc: '5 notas máximas' },
                  { icon: <Award className="w-5 h-5 md:w-6 md:h-6" />, name: 'Dedicado', desc: '7 dias ativos' }
                ].map((a, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl glass mb-3 flex items-center justify-center text-gray-500 group-hover:bg-neon-blue group-hover:text-dark-bg group-hover:neon-glow transition-all">
                      {a.icon}
                    </div>
                    <span className="text-[10px] md:text-xs font-bold block mb-1">{a.name}</span>
                    <span className="text-[9px] md:text-[10px] text-gray-500 font-medium leading-tight">{a.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="glass p-6 md:p-10 rounded-[32px] md:rounded-[48px]">
              <h3 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">Histórico Recente</h3>
              <div className="space-y-4 md:space-y-6">
                {[
                  { date: 'Hoje', action: 'Ajudou Ana Silva em Matemática', xp: '+25 XP' },
                  { date: 'Ontem', action: 'Sessão de Química concluída', xp: '+10 XP' },
                  { date: '25 Mai', action: 'Alcançou o Nível 5!', xp: 'Level Up' }
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-3 md:py-4 border-b border-white/5 last:border-0 grow">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                      <span className="w-10 md:w-12 text-[9px] md:text-[10px] font-bold text-gray-500 uppercase flex-shrink-0">{h.date}</span>
                      <p className="text-xs md:text-sm font-medium text-gray-300 truncate">{h.action}</p>
                    </div>
                    <span className="text-[10px] md:text-xs font-mono font-bold text-neon-blue flex-shrink-0 ml-2">{h.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

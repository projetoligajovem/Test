import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Bell, 
  TrendingUp, 
  Zap, 
  Calendar,
  X,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { UserProfile, HelpRequest, Subject } from '../types';
import Sidebar from '../components/Sidebar';
import HelpRequestCard from '../components/HelpRequestCard';
import QuizModal from '../components/QuizModal';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface DashboardViewProps {
  user: any;
  profile: UserProfile | null;
}

export default function DashboardView({ user, profile }: DashboardViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ... (postForm subjects and useEffect remain same) ...
  const [postForm, setPostForm] = useState({
    title: '',
    description: '',
    subject: 'Matemática' as Subject,
    minLevel: 1,
    availableTime: '',
    tags: '',
  });

  const subjects: Subject[] = ['Matemática', 'Redação', 'Química', 'Física', 'Programação', 'Idiomas'];

  useEffect(() => {
    const q = query(
      collection(db, 'helpRequests'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest));
      setRequests(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'helpRequests');
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName,
        authorPhoto: profile?.photoURL || user.photoURL || '',
        title: postForm.title,
        description: postForm.description,
        subject: postForm.subject,
        minLevel: postForm.minLevel,
        availableTime: postForm.availableTime,
        tags: postForm.tags.split(',').map(t => t.trim()),
        status: 'open',
        chatEnabled: true,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'helpRequests'), requestData);
      setIsPostModalOpen(false);
      setPostForm({ title: '', description: '', subject: 'Matemática', minLevel: 1, availableTime: '', tags: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'helpRequests');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = (request: HelpRequest) => {
    setSelectedRequest(request);
    setIsQuizModalOpen(true);
  };

  const handleQuizSuccess = async () => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const sessionData = {
        requestId: selectedRequest.id,
        participants: [selectedRequest.authorId, user.uid],
        startTime: new Date().toISOString(),
        status: 'ongoing',
        notes: ''
      };
      
      const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
      await updateDoc(doc(db, 'helpRequests', selectedRequest.id), { status: 'active' });
      setIsQuizModalOpen(false);
      navigate(`/session/${sessionRef.id}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'sessions/helpRequests');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject ? r.subject === selectedSubject : true;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-dark-bg flex overflow-x-hidden">
      <Sidebar 
        profile={profile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 w-full md:ml-72 p-6 md:p-12 transition-all">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 md:mb-16">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <h1 className="text-[clamp(1.5rem,4vw,2.25rem)] font-display font-bold tracking-tight mb-1 md:mb-2">
                Olá, <span className="text-neon-blue">{profile?.displayName.split(' ')[0]}</span>
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-medium whitespace-nowrap">Explore novas oportunidades hoje.</p>
            </div>
            
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-400"
            >
              <Filter className="w-6 h-6 rotate-90" />
            </button>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <button className="relative w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all">
              <Bell className="w-5 h-5" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-neon-blue rounded-full neon-glow" />
            </button>
            <button 
              onClick={() => setIsPostModalOpen(true)}
              className="flex-1 md:flex-none h-12 md:h-14 px-6 md:px-8 bg-neon-blue text-dark-bg font-bold rounded-2xl flex items-center justify-center gap-2 md:gap-3 hover:scale-105 transition-all neon-glow"
            >
              <Plus className="w-5 h-5" />
              <span>Pedir Ajuda</span>
            </button>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col gap-6 md:gap-8 mb-10 md:mb-12">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 md:w-6 h-5 md:h-6 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar por assunto..."
              className="w-full h-14 md:h-16 glass rounded-[20px] md:rounded-[24px] pl-14 md:pl-16 pr-6 md:pr-8 text-base md:text-lg outline-none focus:border-neon-blue/50 transition-all font-medium"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
            <button 
              onClick={() => setSelectedSubject(null)}
              className={cn(
                "px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold whitespace-nowrap transition-all border text-sm md:text-base",
                selectedSubject === null 
                  ? "bg-neon-blue text-dark-bg border-neon-blue neon-glow" 
                  : "glass border-white/5 text-gray-500 hover:border-white/20"
              )}
            >
              Todos
            </button>
            {subjects.map(s => (
              <button 
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={cn(
                  "px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold whitespace-nowrap transition-all border text-sm md:text-base",
                  selectedSubject === s 
                    ? "bg-neon-blue text-dark-bg border-neon-blue neon-glow" 
                    : "glass border-white/5 text-gray-500 hover:border-white/20"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map(request => (
              <motion.div 
                key={request.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <HelpRequestCard 
                  request={request} 
                  onClick={handleJoinRequest}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-20 md:py-32 text-center glass rounded-[32px] md:rounded-[40px]">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-6 md:w-8 h-6 md:h-8 text-gray-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-sm md:text-base text-gray-500">Tente ajustar sua pesquisa ou filtros.</p>
            </div>
          )}
        </div>
      </main>

      {/* Right Stats Rail */}
      <aside className="w-80 border-l border-white/5 p-8 hidden xl:block bg-dark-bg/50 backdrop-blur-sm">
        <div className="space-y-8 sticky top-8">
          {/* Daily Streak */}
          <div className="glass p-8 rounded-[32px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-16 h-16 text-yellow-400 fill-yellow-400" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Study Streak
            </h4>
            <div className="text-5xl font-display font-bold mb-2">{profile?.streak}d</div>
            <p className="text-xs font-medium text-gray-400">Você está no fogo! Mantenha a constância.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-6 rounded-[24px]">
              <span className="text-[10px] font-bold text-gray-500 block mb-2 uppercase tracking-wider">Ajudas</span>
              <span className="text-2xl font-display font-bold">{profile?.peopleHelpedCount}</span>
            </div>
            <div className="glass p-6 rounded-[24px]">
              <span className="text-[10px] font-bold text-gray-500 block mb-2 uppercase tracking-wider">Horas</span>
              <span className="text-2xl font-display font-bold">{profile?.hoursStudied}h</span>
            </div>
          </div>

          {/* Ranking card hidden on small side rails */}
          <div className="glass p-8 rounded-[32px]">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-blue" /> Ranking Semanal
            </h4>
            <div className="space-y-6">
              {[
                { name: 'Ana Silva', xp: 2450, rank: 1 },
                { name: 'Pedro Santos', xp: 2100, rank: 2 },
                { name: 'Maria Oliveira', xp: 1980, rank: 3 }
              ].map(r => (
                <div key={r.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-600">#{r.rank}</span>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-[10px]">
                      {r.name[0]}
                    </div>
                    <span className="text-sm font-bold truncate max-w-[100px]">{r.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-neon-blue">{r.xp} XP</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/5 transition-all">
              Ver Ranking
            </button>
          </div>
        </div>
      </aside>

      {/* Post Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="fixed inset-0 bg-dark-bg/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto glass md:rounded-[40px] p-6 md:p-10 z-[101]"
            >
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-transparent py-4 md:static md:py-0">
                <h3 className="text-2xl md:text-3xl font-display font-bold">Criar Nota</h3>
                <button onClick={() => setIsPostModalOpen(false)} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-6 pb-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-2">Título do Problema</label>
                  <input 
                    required
                    placeholder="Ex: Como derivar funções compostas?"
                    className="w-full h-12 md:h-14 glass rounded-xl md:rounded-2xl px-6 focus:border-neon-blue/50 outline-none font-bold text-sm md:text-base"
                    value={postForm.title}
                    onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-2">Matéria</label>
                    <select 
                      className="w-full h-12 md:h-14 glass rounded-xl md:rounded-2xl px-6 focus:border-neon-blue/50 outline-none font-bold bg-dark-bg text-sm md:text-base cursor-pointer"
                      value={postForm.subject}
                      onChange={e => setPostForm({ ...postForm, subject: e.target.value as Subject })}
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-2">Nível Requerido (1-5)</label>
                    <select 
                      className="w-full h-12 md:h-14 glass rounded-xl md:rounded-2xl px-6 focus:border-neon-blue/50 outline-none font-bold bg-dark-bg text-sm md:text-base cursor-pointer"
                      value={postForm.minLevel}
                      onChange={e => setPostForm({ ...postForm, minLevel: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Nível {n}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-2">Descrição Completa</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Descreva detalhadamente..."
                    className="w-full glass rounded-xl md:rounded-2xl p-6 focus:border-neon-blue/50 outline-none font-medium resize-none text-sm md:text-base"
                    value={postForm.description}
                    onChange={e => setPostForm({ ...postForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-2">Horário Disponível</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        required
                        placeholder="Hoje às 18:00"
                        className="w-full h-12 md:h-14 glass rounded-xl md:rounded-2xl pl-12 pr-4 focus:border-neon-blue/50 outline-none font-bold text-sm md:text-base"
                        value={postForm.availableTime}
                        onChange={e => setPostForm({ ...postForm, availableTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-2">Tags</label>
                    <input 
                      placeholder="calculo, enem"
                      className="w-full h-12 md:h-14 glass rounded-xl md:rounded-2xl px-6 focus:border-neon-blue/50 outline-none font-bold text-sm md:text-base"
                      value={postForm.tags}
                      onChange={e => setPostForm({ ...postForm, tags: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full h-14 md:h-16 bg-neon-blue text-dark-bg font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow mt-8"
                >
                  {loading ? 'Publicando...' : 'Publicar Nota'}
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isQuizModalOpen && selectedRequest && (
          <QuizModal 
            request={selectedRequest} 
            onClose={() => setIsQuizModalOpen(false)}
            onSuccess={handleQuizSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

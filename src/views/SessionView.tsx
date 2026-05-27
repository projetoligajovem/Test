import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  Users, 
  ChevronLeft, 
  Star,
  CheckCircle2,
  FileText,
  MoreVertical,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { UserProfile, ChatMessage, Session } from '../types';
import { cn } from '../lib/utils';

interface SessionViewProps {
  user: any;
  profile: UserProfile | null;
}

export default function SessionView({ user, profile }: SessionViewProps) {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<UserProfile[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Load Session
    const loadSession = async () => {
      const sDoc = await getDoc(doc(db, 'sessions', sessionId));
      if (sDoc.exists()) {
        setSession({ id: sDoc.id, ...sDoc.data() } as Session);
        
        // Load participants
        const participantIds = sDoc.data().participants || [];
        const pData = await Promise.all(participantIds.map(async (id: string) => {
          const pDoc = await getDoc(doc(db, 'users', id));
          return pDoc.exists() ? pDoc.data() as UserProfile : null;
        }));
        setParticipants(pData.filter(p => p !== null) as UserProfile[]);
      }
    };
    loadSession();

    // Load Messages
    const q = query(
      collection(db, 'sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sessions/${sessionId}/messages`);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId) return;

    try {
      await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
        senderId: user.uid,
        senderName: profile?.displayName || user.displayName,
        text: newMessage,
        timestamp: new Date().toISOString(),
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `sessions/${sessionId}/messages`);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionId) return;
    await updateDoc(doc(db, 'sessions', sessionId), { status: 'completed' });
    setIsEvaluating(true);
  };

  const submitEvaluation = async () => {
    if (!sessionId || !rating) return;
    setIsEvaluating(false);
    navigate('/dashboard');
  };

  return (
    <div className="h-screen h-[100dvh] bg-dark-bg flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="fixed top-0 w-full h-16 md:h-20 glass border-b border-white/5 z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 md:w-10 md:h-10 glass rounded-lg md:rounded-xl flex items-center justify-center hover:bg-white/10 transition-all flex-shrink-0">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-neon-blue neon-glow flex items-center justify-center font-bold text-dark-bg flex-shrink-0 text-sm md:text-base">
              {session?.requestId ? 'S' : 'M'}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm md:text-lg leading-tight truncate">Sessão de Apoio</h3>
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-neon-blue neon-glow" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider md:tracking-widest truncate">{participants.length} ativos</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex -space-x-3 mr-4">
            {participants.map(p => (
              <div key={p.uid} className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl border-2 border-dark-bg bg-white/5 flex items-center justify-center group relative cursor-pointer">
                {p.photoURL ? <img src={p.photoURL} className="w-full h-full object-cover rounded-lg" alt="" /> : <span className="font-bold text-xs md:text-sm">{p.displayName[0]}</span>}
              </div>
            ))}
          </div>
          
          <button className="hidden sm:flex w-10 10 md:w-12 md:h-12 glass rounded-lg md:rounded-2xl items-center justify-center text-gray-400 hover:text-neon-blue transition-all">
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          {/* Mobile Participants/Resources Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden w-9 h-9 md:w-12 md:h-12 glass rounded-lg md:rounded-2xl flex items-center justify-center text-gray-400 hover:text-neon-blue transition-all"
          >
            <Users className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button 
            onClick={handleCompleteSession}
            className="h-9 md:h-12 px-3 md:px-6 bg-white text-dark-bg text-[10px] md:text-sm font-bold rounded-lg md:rounded-2xl hover:bg-neon-blue hover:neon-glow transition-all whitespace-nowrap"
          >
            Finalizar
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden pt-16 md:pt-20">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId === user.uid;
              const prevMsg = messages[idx - 1];
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

              return (
                <div key={msg.id} className={cn("flex items-start gap-3 md:gap-4", isOwn ? "flex-row-reverse" : "flex-row")}>
                  {showAvatar ? (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center font-bold border border-white/10 flex-shrink-0 text-sm">
                      {msg.senderName[0]}
                    </div>
                  ) : (
                    <div className="w-8 md:w-10 flex-shrink-0" />
                  )}
                  <div className={cn("max-w-[85%] md:max-w-[70%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                    {showAvatar && (
                      <span className="text-[10px] font-bold text-gray-500 mb-1 px-1 uppercase tracking-widest">{msg.senderName}</span>
                    )}
                    <div className={cn(
                      "p-3 md:p-4 rounded-[16px] md:rounded-[20px] text-xs md:text-sm font-medium leading-relaxed break-words w-full",
                      isOwn 
                        ? "bg-neon-blue text-dark-bg rounded-tr-none font-bold" 
                        : "glass rounded-tl-none text-gray-200"
                    )}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-8 bg-dark-bg/80 backdrop-blur-md border-t border-white/5">
            <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto group">
              <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button type="button" className="text-gray-500 hover:text-white transition-colors">
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Enviar mensagem..."
                className="w-full h-12 md:h-16 glass rounded-xl md:rounded-[24px] pl-12 md:pl-16 pr-16 md:pr-20 text-xs md:text-sm outline-none focus:border-neon-blue/40 transition-all font-medium"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-neon-blue text-dark-bg rounded-lg md:rounded-xl flex items-center justify-center hover:scale-105 transition-all neon-glow"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Backdrop for Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar / Resources */}
        <aside className={cn(
          "fixed right-0 top-0 bottom-0 lg:static w-80 md:w-96 border-l border-white/5 p-6 md:p-8 flex flex-col gap-8 bg-dark-bg z-50 transition-transform duration-300 transform lg:transform-none lg:bg-dark-bg/50 overflow-y-auto",
          isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}>
          <div className="flex items-center justify-between lg:hidden mb-4">
            <h3 className="font-bold text-lg">Painel da Sessão</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="w-9 h-9 glass rounded-lg flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neon-blue" /> Arquivos
            </h4>
            <div className="space-y-3">
              {[
                { name: 'Exercicio_Calculo_1.pdf', size: '1.2MB' },
                { name: 'Anotacoes_Resumo.docx', size: '800KB' }
              ].map((file, i) => (
                <div key={i} className="glass p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4 hover:border-neon-blue/30 cursor-pointer transition-all">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-neon-blue" />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs md:text-sm font-bold truncate">{file.name}</div>
                    <div className="text-[9px] md:text-[10px] text-gray-500 font-bold">{file.size}</div>
                  </div>
                </div>
              ))}
              <button className="w-full h-12 border-2 border-dashed border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-[10px] font-bold text-gray-500 hover:border-neon-blue/30 hover:text-neon-blue transition-all">
                + Enviar arquivo
              </button>
            </div>
          </div>

          <div className="glass p-5 md:p-6 rounded-[24px] md:rounded-[32px]">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 ">Metas</h4>
            <div className="space-y-4">
              {[
                'Entender a regra da cadeia',
                'Resolver 3 exercícios',
                'Tirar dúvidas de notação'
              ].map((goal, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded md:rounded-md border border-white/20 flex items-center justify-center flex-shrink-0">
                    {i === 0 && <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-neon-blue" />}
                  </div>
                  <span className={cn("text-[10px] md:text-xs font-medium leading-tight", i === 0 ? "text-gray-400 line-through" : "text-gray-300")}>
                    {goal}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Participantes</h4>
            <div className="space-y-3">
              {participants.map(p => (
                <div key={p.uid} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs ring-1 ring-white/10">
                    {p.displayName[0]}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-xs font-bold truncate">{p.displayName}</div>
                    <div className="text-[8px] text-neon-blue font-bold uppercase tracking-tighter">Nível {p.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {isEvaluating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-bg/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg glass rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-center overflow-y-auto max-h-[90vh]"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-[20px] md:rounded-3xl bg-neon-blue/10 flex items-center justify-center mx-auto mb-6 md:mb-8 border border-neon-blue/20">
                <Star className="w-8 h-8 md:w-12 md:h-12 text-neon-blue neon-glow" />
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 md:mb-4">Sessão Concluída!</h2>
              <p className="text-sm md:text-base text-gray-400 mb-8 md:mb-10 leading-relaxed">Avalie seu colega para fortalecer a comunidade.</p>
              
              <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-12">
                {[1, 2, 3, 4, 5].map(i => (
                  <button 
                    key={i}
                    onClick={() => setRating(i)}
                    className={cn(
                      "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all",
                      rating >= i ? "bg-neon-blue text-dark-bg neon-glow" : "glass text-gray-500"
                    )}
                  >
                    <Star className={cn("w-4 h-4 md:w-6 md:h-6", rating >= i ? "fill-current" : "")} />
                  </button>
                ))}
              </div>

              <button 
                onClick={submitEvaluation}
                className="w-full h-14 md:h-16 bg-neon-blue text-dark-bg font-bold rounded-xl md:rounded-2xl hover:scale-105 transition-all neon-glow text-sm md:text-base"
              >
                Confirmar Avaliação
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

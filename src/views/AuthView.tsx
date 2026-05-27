import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, db, googleProvider } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { Mail, Lock, User, GraduationCap, School, ChevronRight, ChevronLeft, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, Subject } from '../types';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    age: '',
    school: '',
    grade: '',
    subjectsExpert: [] as string[],
    subjectsLearning: [] as string[],
  });

  const subjects: Subject[] = ['Matemática', 'Redação', 'Química', 'Física', 'Programação', 'Idiomas'];

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      // For Google sign in, if it's new, we'd ideally redirect to a profile completion step
      // But for this MVP, we'll just navigate to dashboard if they exist or root
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(user, { displayName: formData.displayName });
        
        const profile: UserProfile = {
          uid: user.uid,
          displayName: formData.displayName,
          email: formData.email,
          age: parseInt(formData.age),
          school: formData.school,
          grade: formData.grade,
          subjectsExpert: formData.subjectsExpert,
          subjectsLearning: formData.subjectsLearning,
          knowledgeLevels: {},
          xp: 0,
          level: 1,
          reputation: 0,
          badges: [],
          streak: 0,
          hoursStudied: 0,
          peopleHelpedCount: 0,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', user.uid), profile);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (list: 'expert' | 'learning', subject: string) => {
    setFormData(prev => {
      const field = list === 'expert' ? 'subjectsExpert' : 'subjectsLearning';
      const current = prev[field];
      const next = current.includes(subject) 
        ? current.filter(s => s !== subject)
        : [...current, subject];
      return { ...prev, [field]: next };
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2698&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-neon-blue/20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl glass rounded-[32px] md:rounded-[40px] p-6 sm:p-10 md:p-14 relative z-10"
      >
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-neon-blue neon-glow items-center justify-center mb-4 md:mb-6">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-dark-bg" />
          </div>
          <h2 className="text-2xl md:text-4xl font-display font-bold tracking-tight mb-2">
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-[280px] md:max-w-none mx-auto">
            {isLogin ? 'Continue sua jornada de aprendizado.' : 'Junte-se à maior rede de estudantes do futuro.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] md:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 md:space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 md:space-y-4"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Nome completo"
                    required
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <input 
                      type="number" 
                      placeholder="Idade"
                      required
                      className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Escola"
                      required
                      className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.school}
                      onChange={e => setFormData({ ...formData, school: e.target.value })}
                    />
                  </div>
                </div>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Série"
                    required
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    value={formData.grade}
                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
              </motion.div>
            )}

            {!isLogin && step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 md:space-y-6"
              >
                <div>
                  <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-neon-blue mb-3 md:mb-4">O que você domina?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject('expert', s)}
                        className={cn(
                          "py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-medium border transition-all",
                          formData.subjectsExpert.includes(s) 
                            ? "bg-neon-blue/20 border-neon-blue text-neon-blue font-bold" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-purple-400 mb-3 md:mb-4">O que quer aprender?</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject('learning', s)}
                        className={cn(
                          "py-2.5 md:py-3 px-3 md:px-4 rounded-lg md:rounded-xl text-[10px] md:text-sm font-medium border transition-all",
                          formData.subjectsLearning.includes(s) 
                            ? "bg-purple-500/20 border-purple-500 text-purple-400 font-bold" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {(isLogin || (!isLogin && step === 3)) && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3 md:space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <input 
                    type="email" 
                    placeholder="E-mail"
                    required
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  <input 
                    type="password" 
                    placeholder="Senha"
                    required
                    className="w-full h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 text-sm focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
            {!isLogin && step > 1 && (
              <button 
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center font-bold hover:bg-white/10 transition-all flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            {!isLogin && step < 3 ? (
              <button 
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex-1 h-12 md:h-14 bg-white text-dark-bg rounded-xl md:rounded-2xl flex items-center justify-center gap-2 text-sm md:text-base font-bold hover:bg-neon-blue hover:neon-glow transition-all"
              >
                Próximo <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            ) : (
              <button 
                disabled={loading}
                className="flex-1 h-12 md:h-14 bg-neon-blue text-dark-bg rounded-xl md:rounded-2xl flex items-center justify-center gap-2 text-sm md:text-base font-bold hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow"
              >
                {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Finalizar'} 
                {!loading && (isLogin ? <LogIn className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />)}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 md:mt-10 pt-8 md:pt-10 border-t border-white/10 flex flex-col items-center gap-4 md:gap-6">
          <p className="text-[10px] md:text-sm text-gray-400 font-medium">Ou continue com</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={handleGoogleSignIn}
              className="flex-1 h-12 md:h-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 hover:bg-white/10 transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 md:w-5 md:h-5" alt="Google" />
              <span className="font-bold text-xs md:text-sm">Google</span>
            </button>
          </div>

          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1);
            }}
            className="text-[10px] md:text-sm font-bold text-neon-blue hover:underline underline-offset-4"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

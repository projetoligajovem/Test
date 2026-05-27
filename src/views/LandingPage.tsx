import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-neon-blue/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-dark-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neon-blue neon-glow flex items-center justify-center">
              <span className="text-dark-bg font-bold">P</span>
            </div>
            <span className="text-xl md:text-2xl font-display font-bold tracking-tight">Ponte</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#impacto" className="hover:text-white transition-colors">Impacto</a>
            <button 
              onClick={() => navigate('/auth')}
              className="px-6 py-2 rounded-full bg-white text-dark-bg hover:bg-neon-blue hover:neon-glow transition-all duration-300 font-bold"
            >
              Começar agora
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-gray-400"
          >
            {isMenuOpen ? <BookOpen className="w-6 h-6 rotate-45" /> : <BookOpen className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/5 bg-dark-bg/95 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                <a 
                  href="#como-funciona" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Como funciona
                </a>
                <a 
                  href="#impacto" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Impacto
                </a>
                <button 
                  onClick={() => navigate('/auth')}
                  className="w-full py-4 rounded-2xl bg-neon-blue text-dark-bg font-bold neon-glow transition-all"
                >
                  Começar agora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 px-6 overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[1000px] bg-neon-blue/5 rounded-full blur-[80px] md:blur-[120px] -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-neon-blue/10 text-neon-blue rounded-full border border-neon-blue/20">
              Future of Education • 2026
            </span>
            <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-display font-bold tracking-tight leading-tight mb-6 md:mb-8">
              Todo estudante tem dificuldade em algo. Mas todo estudante tem algo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">ensinar.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Transformando colaboração em aprendizado real. Conectamos quem precisa com quem domina, criando uma ponte de conhecimento mútua.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto px-8 py-4 md:py-5 bg-neon-blue text-dark-bg font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-transform neon-glow text-base md:text-lg"
              >
                Entrar na Ponte <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 md:py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold transition-all text-base md:text-lg">
                Ver demonstração
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="como-funciona" className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8 text-neon-blue" />,
                title: "Troca Mútua",
                desc: "Ajude em Matemática e receba ajuda em Redação. O equilíbrio perfeito para o seu crescimento."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-neon-blue" />,
                title: "IA Validada",
                desc: "Nosso sistema valida o nível de cada participante para garantir sessões produtivas e eficientes."
              },
              {
                icon: <Award className="w-8 h-8 text-neon-blue" />,
                title: "Gamificação Real",
                desc: "Ganhe XP, medalhas e reputação real na comunidade enquanto evolui seus conhecimentos."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass p-8 md:p-10 rounded-[32px] hover:border-neon-blue/30 transition-colors"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl md:text-2xl font-display font-semibold mb-3 md:mb-4">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Impact / Stats */}
      <section id="impacto" className="py-16 md:py-20 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Estudantes", val: "12K+" },
              { label: "Sessões", val: "45K+" },
              { label: "Matérias", val: "24" },
              { label: "Satisfação", val: "99%" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-5xl font-display font-bold text-neon-blue mb-2">{stat.val}</div>
                <div className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-40 px-6">
        <div className="max-w-5xl mx-auto glass p-10 md:p-24 rounded-[40px] md:rounded-[48px] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 to-transparent pointer-events-none" />
          <h2 className="text-[clamp(1.75rem,5vw,3rem)] font-display font-bold mb-6 md:mb-8 leading-tight">Pronto para transformar sua rotina de estudos?</h2>
          <button 
            onClick={() => navigate('/auth')}
            className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-dark-bg font-bold rounded-2xl text-base md:text-lg hover:bg-neon-blue hover:neon-glow transition-all"
          >
            Começar Gratuitamente
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neon-blue flex items-center justify-center text-[10px] text-dark-bg font-bold">P</div>
            <span className="font-display font-bold tracking-tight">Ponte</span>
          </div>
          <div className="text-gray-500 text-xs md:text-sm text-center md:text-left">
            © 2026 Ponte Educacional. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

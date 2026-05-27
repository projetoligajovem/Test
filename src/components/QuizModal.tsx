import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { HelpRequest } from '../types';

interface QuizModalProps {
  request: HelpRequest;
  onClose: () => void;
  onSuccess: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function QuizModal({ request, onClose, onSuccess }: QuizModalProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: request.subject,
            level: request.minLevel,
            topic: request.title
          })
        });
        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions);
        } else {
          setError('Falha ao carregar quiz. Tente novamente.');
        }
      } catch (err) {
        setError('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [request]);

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Logic to check if passed (e.g., all correct)
      const correctCount = newAnswers.reduce((acc, ans, i) => {
        return acc + (ans === questions[i].correctIndex ? 1 : 0);
      }, 0);
      
      const isPassed = correctCount >= questions.length * 0.6; // 60% correct
      setPassed(isPassed);
      setFinished(true);
      
      if (isPassed) {
        setTimeout(() => onSuccess(), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-bg/90 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl glass rounded-[40px] p-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4">
          <button onClick={onClose} className="w-10 h-10 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-12 h-12 text-neon-blue animate-spin mx-auto mb-6 neon-glow" />
            <h3 className="text-xl font-display font-bold mb-2">Validando com IA...</h3>
            <p className="text-gray-500 font-medium">Estamos gerando perguntas inteligentes sobre o tema.</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-display font-bold mb-2">Ops! Algo deu errado.</h3>
            <p className="text-gray-500 font-medium mb-8">{error}</p>
            <button onClick={onClose} className="px-8 py-3 bg-white text-dark-bg font-bold rounded-xl">Voltar</button>
          </div>
        ) : finished ? (
          <div className="py-20 text-center">
            {passed ? (
              <>
                <div className="w-20 h-20 bg-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-blue/20">
                  <CheckCircle2 className="w-10 h-10 text-neon-blue neon-glow" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-2">Nível Validado!</h3>
                <p className="text-gray-400 font-medium">Excelente! Você foi aprovado para esta sessão.</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-2">Nível Insuficiente</h3>
                <p className="text-gray-400 mb-8 font-medium leading-relaxed">
                  Seu nível atual ainda não atende os requisitos desta sessão. 
                  Você pode praticar mais ou enviar um pedido manual ao dono da nota.
                </p>
                <div className="flex gap-4">
                  <button className="flex-1 h-14 glass rounded-2xl font-bold hover:bg-white/5 transition-all">Enviar Pedido Manual</button>
                  <button onClick={onClose} className="flex-1 h-14 bg-white text-dark-bg rounded-2xl font-bold hover:bg-neon-blue transition-all">Praticar Mais</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-6">
            <div className="flex items-center justify-between mb-10">
              <span className="text-xs font-bold text-neon-blue uppercase tracking-widest">Validação Inteligente</span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pergunta {currentIndex + 1} de {questions.length}</span>
            </div>

            <h3 className="text-2xl font-display font-bold mb-8 leading-tight">
              {questions[currentIndex].question}
            </h3>

            <div className="space-y-3">
              {questions[currentIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className="w-full glass p-6 rounded-2xl text-left font-medium hover:border-neon-blue/30 hover:bg-white/5 transition-all flex items-center justify-between group"
                >
                  <span className="flex-1">{option}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-neon-blue group-hover:text-dark-bg transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-neon-blue neon-glow"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

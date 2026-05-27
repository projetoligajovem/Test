import { 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  ChevronRight, 
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import { HelpRequest } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HelpRequestCardProps {
  request: HelpRequest;
  onClick: (request: HelpRequest) => void;
}

export default function HelpRequestCard({ request, onClick }: HelpRequestCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-[32px] group cursor-pointer hover:border-neon-blue/30 transition-all flex flex-col h-full"
      onClick={() => onClick(request)}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-purple-500/20 flex items-center justify-center border border-white/5 overflow-hidden">
            {request.authorPhoto ? (
              <img src={request.authorPhoto} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="font-bold text-lg">{request.authorName[0]}</span>
            )}
          </div>
          <div>
            <h4 className="font-bold text-white text-lg group-hover:text-neon-blue transition-colors">
              {request.authorName}
            </h4>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1">
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-bold uppercase tracking-widest border border-neon-blue/20">
            {request.subject}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest border border-white/10">
            Nível {request.minLevel}+
          </span>
        </div>

        <h3 className="text-xl font-display font-bold mb-4 line-clamp-2 leading-tight">
          {request.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
          {request.description}
        </p>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{request.availableTime}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-neon-blue group-hover:text-dark-bg transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}

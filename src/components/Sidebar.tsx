import React from 'react';
import { Menu, MessageSquare, PlusCircle } from 'lucide-react';
import { Challenge, Theme } from '../types';

interface SidebarProps {
  challenges: Challenge[];
  currentChallenge: Challenge | null;
  onSelectChallenge: (challenge: Challenge) => void;
  onNewChallenge: () => void;
  theme: Theme;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  challenges,
  currentChallenge,
  onSelectChallenge,
  onNewChallenge,
  theme,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      <button
        onClick={onToggle}
        className={`fixed right-4 top-4 z-50 p-2 rounded-md transition-colors ${
          theme === 'dark' ? 'text-white hover:bg-white/10' : 'text-black hover:bg-black/10'
        }`}
        aria-label="Toggle Sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className={`w-80 h-screen fixed right-0 top-0 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${theme === 'dark' ? 'bg-black/80 text-white' : 'bg-white/80 text-black'
      } backdrop-blur-md p-4 flex flex-col pt-16`}>
        <button
          onClick={onNewChallenge}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg mb-4 hover:bg-opacity-10 hover:bg-white transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Novo Desafio</span>
        </button>
        
        <div className="flex-1 overflow-y-auto">
          {challenges.map((challenge) => (
            <button
              key={challenge.id}
              onClick={() => onSelectChallenge(challenge)}
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg mb-2 transition-colors ${
                currentChallenge?.id === challenge.id
                  ? theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                  : 'hover:bg-opacity-10 hover:bg-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="truncate">{challenge.title}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
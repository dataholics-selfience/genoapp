import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Message, Theme } from '../types';
import { Search, Brain, ListChecks, Database, Target } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  theme: Theme;
  isLoading?: boolean;
  challengeTitle?: string;
  userInitials?: string;
}

const LoadingStates = [
  {
    icon: Search,
    text: "Buscando na lista de milhares de startups..."
  },
  {
    icon: Brain,
    text: "Criando um processo seletivo virtual..."
  },
  {
    icon: ListChecks,
    text: "Primeira shortlist de Startups indicadas..."
  },
  {
    icon: Database,
    text: "Pesquisa de mercado e POCs por I.A...."
  },
  {
    icon: Target,
    text: "Fechamento do programa de inovação virtual..."
  }
];

const MessageList: React.FC<MessageListProps> = ({ messages, theme, isLoading, challengeTitle, userInitials }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [currentLoadingState, setCurrentLoadingState] = React.useState(0);
  const [showLoading, setShowLoading] = React.useState(false);
  const loadingTimerRef = React.useRef<NodeJS.Timeout>();
  const prevMessagesLengthRef = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      loadingTimerRef.current = setTimeout(() => {
        setShowLoading(true);
      }, 5000);
    } else {
      clearTimeout(loadingTimerRef.current);
      setShowLoading(false);
      setCurrentLoadingState(0);
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return () => {
      clearTimeout(loadingTimerRef.current);
    };
  }, [isLoading]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showLoading && currentLoadingState < LoadingStates.length - 1) {
      timeout = setTimeout(() => {
        setCurrentLoadingState(prev => prev + 1);
      }, 8000); // Changed from 12000 to 8000
    }
    return () => clearTimeout(timeout);
  }, [showLoading, currentLoadingState]);

  if (messages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center p-4 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <div className="text-center max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Gen.Oi</h2>
          <p>Genie, sua assistente de inovação aberta com acesso a mais de 75 mil startups internacionais. Digite seu nome e inicie a descrição dos desafios de sua empresa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          theme={theme}
          challengeTitle={challengeTitle}
          userInitials={userInitials}
        />
      ))}
      {isLoading && showLoading && (
        <div className="py-6 bg-black/20">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-start gap-4">
              <img 
                src="https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=256" 
                alt="Genie AI"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
                {React.createElement(LoadingStates[currentLoadingState].icon, {
                  className: "w-5 h-5 text-blue-400 animate-pulse"
                })}
                <span className="text-gray-300">
                  {LoadingStates[currentLoadingState].text}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
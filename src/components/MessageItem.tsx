import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType, Theme } from '../types';
import { Rocket } from 'lucide-react';
import StartupCardsModal from './StartupCardsModal';

interface MessageItemProps {
  message: MessageType;
  theme: Theme;
  challengeTitle?: string;
  userInitials?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, theme, challengeTitle, userInitials }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayText, setDisplayText] = useState(message.content);
  const isUser = message.role === 'user';
  const typingSpeedRef = useRef(80);
  const isNewMessage = useRef(true);
  
  useEffect(() => {
    if (message.content !== displayText) {
      isNewMessage.current = true;
    }
  }, [message.content]);

  useEffect(() => {
    if (!isUser && !message.isHtml && isNewMessage.current) {
      let index = 0;
      const text = message.content;
      let acceleration = 1;
      setDisplayText('');
      
      const typeText = () => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
          
          if (index > 10) {
            acceleration = Math.min(acceleration * 1.1, 3);
          }
          
          const currentSpeed = Math.max(20, typingSpeedRef.current / acceleration);
          setTimeout(typeText, currentSpeed);
        } else {
          setDisplayText(text);
          isNewMessage.current = false;
        }
      };
      
      typeText();
    } else {
      setDisplayText(message.content);
    }
  }, [message.content, isUser, message.isHtml]);

  const hasStartupCards = message.content.includes('<startup cards>');
  let startupData;
  
  if (hasStartupCards) {
    try {
      const match = message.content.match(/<startup cards>(.*?)<\/startup cards>/s);
      if (match) {
        startupData = JSON.parse(match[1]);
      }
    } catch (error) {
      console.error('Error parsing startup cards data:', error);
    }
  }

  const content = hasStartupCards 
    ? (
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-[90%] flex items-start gap-4 px-6 py-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-left"
      >
        <Rocket className="w-6 h-6 flex-shrink-0 mt-1" />
        <div>
          <div className="font-medium text-lg">
            {startupData?.challengeTitle || challengeTitle || 'Lista de Startups'}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Clique para ver a análise completa de startups alinhadas com seu desafio.
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {message.timestamp.toLocaleString()}
          </div>
        </div>
      </button>
    ) 
    : message.isHtml 
      ? (
        <div 
          dangerouslySetInnerHTML={{ __html: displayText }}
          className={`
            ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
            [&_a]:text-blue-400 [&_a]:underline 
            [&_img]:max-w-full [&_img]:rounded-lg
          `}
        />
      ) 
      : (
        <p className={`${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {displayText}
          {!isUser && displayText !== message.content && isNewMessage.current && (
            <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />
          )}
        </p>
      );
  
  return (
    <>
      <div className={`py-6 ${
        theme === 'dark' 
          ? (isUser ? 'bg-black/40' : 'bg-black/20') 
          : (isUser ? 'bg-gray-100' : 'bg-white')
      }`}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-start gap-4">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-medium">{userInitials}</span>
              </div>
            ) : (
              <img 
                src="https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=256" 
                alt="Genie AI"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div className="flex-1 prose max-w-none">
              {content}
            </div>
          </div>
        </div>
      </div>

      {hasStartupCards && (
        <StartupCardsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          content={message.content}
          challengeTitle={startupData?.challengeTitle || challengeTitle || 'Lista de Startups'}
          timestamp={message.timestamp}
        />
      )}
    </>
  );
};

export default MessageItem;
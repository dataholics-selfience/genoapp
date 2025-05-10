import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  onFocus?: () => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, onFocus, disabled }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    if (isLoading) {
      setMessage('');
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading && !disabled) {
      await onSendMessage(message);
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 px-4 py-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end rounded-lg border border-gray-700 bg-gray-900 p-2 shadow-sm">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder={
              disabled
                ? "Você atingiu o limite do seu plano. Faça um upgrade para continuar."
                : isLoading
                ? ""
                : "Envie uma mensagem..."
            }
            className="flex-1 max-h-[200px] resize-none border-0 bg-transparent p-2 text-white outline-none text-sm sm:text-base"
            rows={1}
            disabled={isLoading || disabled}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading || disabled}
            className={`p-2 rounded-md ${
              !message.trim() || isLoading || disabled
                ? 'text-gray-600'
                : 'text-white hover:bg-gray-700'
            } transition-colors`}
            aria-label="Enviar mensagem"
          >
            <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        {isLoading && (
          <div className="text-center mt-2">
            <span className="text-sm text-gray-400">
              Processando...
            </span>
          </div>
        )}
        {disabled && (
          <div className="text-center mt-2">
            <span className="text-sm text-red-400">
              Você atingiu o limite do seu plano. Faça um upgrade para continuar.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageInput;
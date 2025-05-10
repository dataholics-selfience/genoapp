import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NewChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (title: string) => void;
}

const NewChallengeModal: React.FC<NewChallengeModalProps> = ({
  isOpen,
  onClose,
  onCreateChallenge,
}) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateChallenge(title.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md p-6 rounded-lg shadow-xl bg-gray-900 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Novo Desafio</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="challenge-title" className="block text-sm font-medium text-gray-300 mb-1">
              Nome do Desafio
            </label>
            <input
              type="text"
              id="challenge-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Digite o nome do desafio"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Criar Desafio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChallengeModal;
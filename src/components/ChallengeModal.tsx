import React, { useState } from 'react';
import { Rocket, X, Trash2, PlusCircle } from 'lucide-react';
import { Challenge } from '../types';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
  onRenameChallenge: (challengeId: string, newTitle: string) => void;
  onDeleteChallenge: (challengeId: string) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  challenges,
  onSelectChallenge,
  onRenameChallenge,
  onDeleteChallenge,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRename = (challenge: Challenge) => {
    const newTitle = prompt('Digite o novo nome do desafio:', challenge.title);
    if (newTitle && newTitle.trim() !== '') {
      onRenameChallenge(challenge.id, newTitle.trim());
    }
  };

  const handleDelete = (challengeId: string) => {
    setDeletingId(challengeId);
  };

  const confirmDelete = (confirm: boolean) => {
    if (confirm && deletingId) {
      onDeleteChallenge(deletingId);
    }
    setDeletingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md p-6 rounded-lg shadow-xl bg-gray-900 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Desafios Cadastrados</h2>
        
        <button
          onClick={() => {
            onClose();
            document.querySelector<HTMLButtonElement>('[title="Novo desafio"]')?.click();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 mb-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Novo Desafio</span>
        </button>
        
        <div className="max-h-96 overflow-y-auto">
          {challenges.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum desafio cadastrado</p>
          ) : (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-3 mb-2 rounded-lg hover:bg-gray-800"
              >
                {deletingId === challenge.id ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-gray-300">Tem certeza que deseja apagar o desafio?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmDelete(true)}
                        className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => confirmDelete(false)}
                        className="px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-700"
                      >
                        Não
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onSelectChallenge(challenge);
                        onClose();
                      }}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Rocket className="w-5 h-5" />
                      <span className="flex-1 text-left">{challenge.title}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="p-1 rounded hover:bg-gray-700"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(challenge);
                        }}
                        className="px-2 py-1 text-sm rounded hover:bg-gray-700"
                      >
                        Renomear
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;
import React from 'react';
import { Pencil } from 'lucide-react';

interface HeaderProps {
  title?: string;
  onRename?: (newTitle: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onRename }) => {
  const handleRename = () => {
    if (onRename && title) {
      const newTitle = prompt('Digite o novo nome do desafio:', title);
      if (newTitle && newTitle.trim() !== '') {
        onRename(newTitle.trim());
      }
    }
  };

  return (
    <header className="sticky top-0 z-10 px-4 py-3 backdrop-blur-md bg-black/70 text-white border-b border-gray-800">
      <div className="max-w-5xl mx-auto flex items-center">
        {title ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Desafio:</span>
            <h1 className="text-xl font-bold">{title}</h1>
            <button
              onClick={handleRename}
              className="p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <h1 className="text-xl font-bold">Gen.Oi</h1>
        )}
      </div>
    </header>
  );
};

export default Header;
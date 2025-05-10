import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Activity, ChevronRight, ChevronLeft } from 'lucide-react';
import Header from './Header';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChallengeModal from './ChallengeModal';
import NewChallengeModal from './NewChallengeModal';
import UserProfileModal from './UserProfileModal';
import SubscriptionModal from './SubscriptionModal';
import { useAuth } from '../contexts/AuthContext';
import useChat from '../hooks/useChat';

const Chat: React.FC = () => {
  const { signOut, userData } = useAuth();
  const navigate = useNavigate();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    challenges,
    currentChallenge,
    createNewChallenge,
    selectChallenge,
    renameChallenge,
    deleteChallenge,
    startupListCount,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    hasReachedPlanLimit
  } = useChat();
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleInputFocus = () => {
    if (hasReachedPlanLimit()) {
      setIsSubscriptionModalOpen(true);
      return;
    }
    if (!currentChallenge && !isNewChallengeModalOpen) {
      setIsNewChallengeModalOpen(true);
    }
  };

  const userInitials = userData?.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const firstName = userData?.fullName.split(' ')[0];

  return (
    <div className="min-h-screen flex bg-black text-white relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 blur-sm"
        style={{ 
          backgroundImage: 'url(https://images.pexels.com/photos/327509/pexels-photo-327509.jpeg)',
          zIndex: -1 
        }}
      />
      
      <div 
        className={`fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ${
          isSidebarExpanded ? 'w-72' : 'w-20'
        }`}
      >
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4">
            {isSidebarExpanded ? (
              <img 
                src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png"
                alt="Gen.Oi Logo"
                className="h-10 object-contain mb-8"
              />
            ) : (
              <img 
                src="https://genoi.net/wp-content/uploads/2025/05/small0white-Gengo-gen.OI-Novo-1.png"
                alt="Gen.Oi Logo"
                className="h-10 object-contain mb-8"
              />
            )}
            
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setIsNewChallengeModalOpen(true)}
                disabled={hasReachedPlanLimit()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${
                  isSidebarExpanded ? 'w-full' : 
                  'w-12 justify-center'
                } ${
                  hasReachedPlanLimit() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={isSidebarExpanded ? undefined : "Novo desafio"}
              >
                <PlusCircle className="w-5 h-5 flex-shrink-0" />
                {isSidebarExpanded && <span>Novo desafio</span>}
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setIsChallengeModalOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ${
                  isSidebarExpanded ? 'w-full' : 'w-12 justify-center'
                }`}
                title={isSidebarExpanded ? undefined : "Desafios monitorados"}
              >
                <Activity className="w-5 h-5 flex-shrink-0" />
                {isSidebarExpanded && <span>Desafios monitorados</span>}
                <div className="flex items-center justify-center min-w-[20px] h-5 text-xs bg-red-500 text-white rounded-full">
                  {startupListCount}
                </div>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {challenges.map(challenge => (
              <button
                key={challenge.id}
                onClick={() => selectChallenge(challenge)}
                disabled={hasReachedPlanLimit()}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors mb-2 ${
                  currentChallenge?.id === challenge.id
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                } ${
                  hasReachedPlanLimit() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSidebarExpanded ? (
                  <span className="truncate">{challenge.title}</span>
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    {challenge.title[0]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`w-full flex items-center gap-3 p-4 hover:bg-white/10 transition-colors ${
              isSidebarExpanded ? '' : 'justify-center'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">{userInitials}</span>
            </div>
            {isSidebarExpanded && (
              <span className="truncate">{firstName}</span>
            )}
          </button>
          
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="w-full p-4 flex items-center justify-center hover:bg-white/10 transition-colors"
            title={isSidebarExpanded ? "Recolher" : "Expandir"}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarExpanded ? 'ml-72' : 'ml-20'
      }`}>
        <Header 
          title={currentChallenge?.title} 
          onRename={currentChallenge ? (newTitle) => renameChallenge(currentChallenge.id, newTitle) : undefined}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MessageList 
            messages={messages} 
            theme="dark" 
            isLoading={isLoading}
            challengeTitle={currentChallenge?.title}
            userInitials={userInitials}
          />
          <MessageInput 
            onSendMessage={sendMessage} 
            isLoading={isLoading}
            onFocus={handleInputFocus}
            disabled={hasReachedPlanLimit()}
          />
        </main>
      </div>

      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        challenges={challenges}
        onSelectChallenge={selectChallenge}
        onRenameChallenge={renameChallenge}
        onDeleteChallenge={deleteChallenge}
      />

      <NewChallengeModal
        isOpen={isNewChallengeModalOpen}
        onClose={() => setIsNewChallengeModalOpen(false)}
        onCreateChallenge={createNewChallenge}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={userData?.subscriptionPlan}
      />
    </div>
  );
};

export default Chat;
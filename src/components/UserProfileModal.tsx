import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth, sendPasswordResetEmail } from '../services/firebase';
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { SUBSCRIPTION_PLANS } from '../types';
import SubscriptionModal from './SubscriptionModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { userData, updateUserData, deleteAccount, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    cpf: userData?.cpf || '',
    company: userData?.company || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDataDeleteConfirm, setShowDataDeleteConfirm] = useState(false);
  const [showGoodbye, setShowGoodbye] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    try {
      await updateUserData({
        fullName: formData.fullName,
        phone: formData.phone,
        company: formData.company,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, userData?.email || '');
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    if (!showDataDeleteConfirm) {
      setShowDataDeleteConfirm(true);
      setShowPasswordInput(true);
      return;
    }

    if (!password) {
      setDeleteError('Por favor, insira sua senha para confirmar a exclusão da conta.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user || !userData?.email) {
        throw new Error('Usuário não encontrado');
      }

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(userData.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete the account
      await deleteAccount();
      
      // Sign out immediately after deletion
      await signOut();
      
      // Show goodbye message and redirect
      setShowGoodbye(true);
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError('Senha incorreta. Por favor, tente novamente.');
      } else {
        setDeleteError('Erro ao excluir conta. Por favor, tente novamente.');
      }
    }
  };

  const currentPlan = userData?.subscriptionPlan;
  const planDetails = currentPlan ? SUBSCRIPTION_PLANS[currentPlan] : null;

  if (showGoodbye) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
        <div className="max-w-md text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Seu usuário foi apagado com sucesso</h2>
          <p className="mb-4">Foi uma pena vê-lo partir, mas esperamos nos encontrar em breve.</p>
          <p className="text-xl">Bons caminhos para a inovação! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Meu Perfil</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Subscription Plan Section */}
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-medium text-white mb-2">Plano Atual</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-blue-400">{planDetails?.name || 'Não definido'}</p>
                  <p className="text-sm text-gray-400">{planDetails?.description}</p>
                </div>
                <button
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Alterar Plano
                </button>
              </div>
            </div>

            {/* User Data Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Celular</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">CPF</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  disabled
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Empresa</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasswordReset}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Recuperar Senha por Email
                  </button>
                </div>
                {resetEmailSent && (
                  <p className="text-green-400 text-sm mt-2">
                    Email de recuperação de senha enviado!
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between gap-4 mt-6">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={signOut}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Sair
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Editar
                  </button>
                </>
              )}
            </div>

            {/* Delete Account Section */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">Zona de Perigo</h4>
                <p className="text-sm text-gray-300 mb-4">
                  Ao excluir sua conta, você perderá acesso a todos os recursos da plataforma.
                  Esta ação não pode ser desfeita.
                </p>
                {showPasswordInput && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Digite sua senha para confirmar
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white mb-2"
                      placeholder="Sua senha"
                    />
                    {deleteError && (
                      <p className="text-red-400 text-sm">{deleteError}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {showDataDeleteConfirm
                    ? "Sim, quero excluir minha conta"
                    : showDeleteConfirm
                    ? "Tem certeza? Esta ação não pode ser desfeita"
                    : "Excluir Conta"}
                </button>
                {(showDeleteConfirm || showDataDeleteConfirm) && (
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setShowDataDeleteConfirm(false);
                      setShowPasswordInput(false);
                      setPassword('');
                      setDeleteError('');
                    }}
                    className="w-full mt-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={userData?.subscriptionPlan}
      />
    </div>
  );
};

export default UserProfileModal;
import React, { useState } from 'react';
import { X, Baby, Swords, Crown, Sparkles } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '../types';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: SubscriptionPlan;
}

const planIcons = {
  'padawan': Baby,
  'jedi': Swords,
  'mestre-jedi': Crown,
  'adm-universo': Sparkles,
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan
}) => {
  const { currentUser, userData } = useAuth();
  const [upgrading, setUpgrading] = useState<SubscriptionPlan | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!currentUser) return;
    
    try {
      setUpgrading(plan);

      // Deactivate current plan
      const plansRef = collection(db, 'plans');
      const currentPlanQuery = query(
        plansRef,
        where('userId', '==', currentUser.uid),
        where('active', '==', true)
      );
      const currentPlanSnapshot = await getDocs(currentPlanQuery);
      
      if (!currentPlanSnapshot.empty) {
        const currentPlanDoc = currentPlanSnapshot.docs[0];
        await updateDoc(doc(db, 'plans', currentPlanDoc.id), {
          active: false,
          deactivatedAt: new Date()
        });
      }

      // Create new plan
      await addDoc(plansRef, {
        userId: currentUser.uid,
        planType: plan,
        createdAt: new Date(),
        active: true
      });

      // Update user data
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        subscriptionPlan: plan
      });

      onClose();
      window.location.reload(); // Refresh to apply new plan
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Planos de Assinatura</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
            const Icon = planIcons[key as SubscriptionPlan];
            const isCurrentPlan = currentPlan === key;
            const isUpgrading = upgrading === key;
            
            return (
              <div
                key={key}
                className={`bg-gray-800 rounded-lg p-6 flex flex-col ${
                  isCurrentPlan ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-8 h-8 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                </div>
                <div className="text-3xl font-bold text-white mb-4">
                  {plan.price === 0 ? 'Grátis' : `R$ ${plan.price.toLocaleString()}`}
                </div>
                <p className="text-gray-400 mb-4">Até {plan.limit} desafios</p>
                <div className="mt-auto">
                  <button
                    onClick={() => handleUpgrade(key as SubscriptionPlan)}
                    className={`block w-full py-2 px-4 rounded-md text-center transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={isCurrentPlan || isUpgrading}
                  >
                    {isCurrentPlan 
                      ? 'Plano Atual' 
                      : isUpgrading 
                        ? 'Atualizando...' 
                        : 'Contratar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
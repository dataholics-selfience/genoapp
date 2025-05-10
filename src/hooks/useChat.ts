import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, increment, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ChatState, Message, Challenge, SUBSCRIPTION_PLANS } from '../types';
import { sendMessageToWebhook } from '../services/webhookService';

const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 14);
};

const welcomeMessages = [
  "Tudo bom? Eu sou a Genie, sua agente IA para encontrar as melhores startups para resolver seus desafios! Qual é seu nome e qual empresa você representa?",
  "Tudo beleza? Sou Genie, sua agente de inovação aberta turbinada com um conhecimento de mais de 77 mil startups globais. Qual é seu desafio?",
  "Prazer em conhecê-lo! Sou a Genie, sua agente de inteligência artificial para os desafios mais complexos de inovação aberta. Pode iniciar a descrição de seu problema ou desafio?",
  "Oi! Genie aqui, sua parceira em inovação! Pronta para mergulhar no universo de 77 mil startups e encontrar a solução perfeita para seu desafio. Vamos começar?",
  "E aí! Sou a Genie, sua matchmaker de inovação! 💡 Tenho um banco de dados incrível com milhares de startups esperando para revolucionar seu negócio. Qual desafio vamos resolver hoje?",
  "Olá! Genie na área! Pronta para ser sua GPS no mundo das startups - Garantindo Parcerias Sensacionais! 🚀 Como posso ajudar?",
  "Fala, inovador! Genie aqui, sua caçadora oficial de startups! Com mais de 77 mil opções na manga, estou pronta para encontrar aquela parceria que vai fazer a diferença. Vamos nessa?",
  "Opa! Bem-vindo ao futuro da inovação! Sou a Genie, sua consultora virtual especialista em conexões com startups. Qual desafio você quer transformar em oportunidade hoje?",
  "Hey! Genie presente! 🌟 Imagine ter acesso a um universo de 77 mil startups... Pois é, você tem! Sou sua guia nessa jornada de inovação. Por onde começamos?",
  "Salve! Aqui é a Genie, sua parceira de inovação aberta! Pronta para vasculhar o ecossistema global de startups e encontrar aquela solução que você tanto procura. Qual o desafio da vez?",
  "Hello! Genie na linha! 🎯 Especialista em transformar desafios em oportunidades através das melhores startups do mercado. Vamos inovar juntos?",
  "Oi! Que bom ter você aqui! Sou a Genie, sua especialista em inovação aberta. Com acesso a mais de 77 mil startups, estou pronta para encontrar a solução perfeita para seu desafio! 🚀",
  "Olá! Genie falando! Pronta para uma jornada de inovação? Com minha base de dados de startups globais, vamos encontrar parceiros incríveis para seu negócio! 💫",
  "E aí! Genie na área, sua navegadora no oceano da inovação! 🌊 Com milhares de startups mapeadas, vamos encontrar seu match perfeito!",
  "Oi! Sou a Genie, sua consultora de inovação digital! 🤖 Pronta para conectar seu desafio com as startups mais promissoras do mercado!",
  "Fala, parceiro! Genie aqui, sua bússola no universo das startups! 🧭 Vamos explorar juntos as melhores soluções para sua empresa?",
  "Hey! Genie presente, sua curadora de inovação! ✨ Com acesso a um banco de dados global de startups, estou aqui para transformar seus desafios em oportunidades!",
  "Olá! Aqui é a Genie, sua mentora de inovação aberta! 🎓 Pronta para compartilhar conhecimento e conectar você com as startups mais inovadoras!",
  "Oi! Genie falando, sua parceira estratégica em inovação! 🎯 Vamos descobrir juntos as startups que vão revolucionar seu negócio?",
  "E aí! Genie na linha, sua facilitadora de inovação! 🌟 Com milhares de startups mapeadas, estou pronta para encontrar a solução ideal para seu desafio!",
  "Olá! Sou a Genie, sua guia no ecossistema de startups! 🌍 Vamos explorar as possibilidades infinitas da inovação aberta?",
  "Hey! Genie aqui, sua expert em conexões inovadoras! 🔗 Pronta para unir seu desafio com as startups mais disruptivas do mercado!",
  "Fala! Genie presente, sua aliada em transformação digital! 💻 Vamos encontrar as startups que vão impulsionar sua empresa para o futuro?"
];

const useChat = () => {
  const { currentUser, userData } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    challenges: [],
    currentChallenge: null,
    startupListCount: 0,
  });
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  // Check if user has reached their plan limit
  const hasReachedPlanLimit = () => {
    if (!activePlan) return true;
    const plan = SUBSCRIPTION_PLANS[activePlan as keyof typeof SUBSCRIPTION_PLANS];
    return state.startupListCount >= plan.limit;
  };

  // Load active plan from Firestore
  useEffect(() => {
    const loadActivePlan = async () => {
      if (!currentUser) return;

      try {
        const plansRef = collection(db, 'plans');
        const q = query(
          plansRef,
          where('userId', '==', currentUser.uid),
          where('active', '==', true)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const planData = snapshot.docs[0].data();
          setActivePlan(planData.planType);
        } else {
          // Set default plan if no active plan exists
          const defaultPlan = 'padawan';
          await addDoc(plansRef, {
            userId: currentUser.uid,
            planType: defaultPlan,
            createdAt: new Date(),
            active: true
          });
          setActivePlan(defaultPlan);
        }
      } catch (error) {
        console.error('Error loading active plan:', error);
      }
    };

    loadActivePlan();
  }, [currentUser]);

  // Load challenges and their messages
  useEffect(() => {
    const loadChallengesAndMessages = async () => {
      if (!currentUser) return;

      try {
        // Load challenges
        const challengesRef = collection(db, 'challenges');
        const challengesQuery = query(
          challengesRef, 
          where('userEmail', '==', currentUser.email),
          where('deleted', '==', false)
        );
        const challengesSnapshot = await getDocs(challengesQuery);
        
        const loadedChallenges = await Promise.all(
          challengesSnapshot.docs.map(async (doc) => {
            const challenge = { ...doc.data(), id: doc.id } as Challenge;
            
            // Load messages for this challenge
            const messagesRef = collection(db, 'messages');
            const messagesQuery = query(
              messagesRef,
              where('challengeId', '==', challenge.id),
              orderBy('timestamp', 'asc')
            );
            const messagesSnapshot = await getDocs(messagesQuery);
            
            challenge.messages = messagesSnapshot.docs.map(msgDoc => ({
              ...msgDoc.data(),
              id: msgDoc.id,
              timestamp: msgDoc.data().timestamp.toDate()
            })) as Message[];
            
            return challenge;
          })
        );

        // Load startup list count for user
        const countersRef = collection(db, 'counters');
        const counterQuery = query(countersRef, where('userId', '==', currentUser.uid));
        const counterSnapshot = await getDocs(counterQuery);
        let startupListCount = 0;
        
        if (!counterSnapshot.empty) {
          startupListCount = counterSnapshot.docs[0].data().count || 0;
        }

        setState(prev => ({
          ...prev,
          challenges: loadedChallenges,
          startupListCount,
        }));

        // Add welcome message if no messages exist
        if (loadedChallenges.length === 0) {
          const welcomeMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
            timestamp: new Date(),
            isHtml: false,
          };
          setState(prev => ({
            ...prev,
            messages: [welcomeMessage],
          }));
        }

        // Auto scroll to bottom
        setTimeout(() => {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      } catch (error) {
        console.error('Error loading challenges and messages:', error);
      }
    };

    loadChallengesAndMessages();
  }, [currentUser, activePlan]);

  const createNewChallenge = async (title: string) => {
    if (!currentUser) return;
    
    if (hasReachedPlanLimit()) {
      setIsSubscriptionModalOpen(true);
      return;
    }

    const newChallenge: Challenge = {
      id: uuidv4(),
      title,
      sessionId: generateSessionId(),
      createdAt: new Date(),
      messages: [],
      userEmail: currentUser.email,
      deleted: false
    };

    try {
      const docRef = await addDoc(collection(db, 'challenges'), newChallenge);
      newChallenge.id = docRef.id;

      setState(prev => ({
        ...prev,
        challenges: [...prev.challenges, newChallenge],
        currentChallenge: newChallenge,
        messages: [],
      }));

      // Add welcome message for new challenge
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
        timestamp: new Date(),
        isHtml: false,
      };

      setState(prev => ({
        ...prev,
        messages: [welcomeMessage],
      }));

      // Auto scroll to bottom
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      console.error('Error creating challenge:', error);
    }
  };

  const selectChallenge = (challenge: Challenge) => {
    if (hasReachedPlanLimit()) {
      setIsSubscriptionModalOpen(true);
      return;
    }

    setState(prev => ({
      ...prev,
      currentChallenge: challenge,
      messages: challenge.messages || [],
    }));

    // Auto scroll to bottom
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const renameChallenge = async (challengeId: string, newTitle: string) => {
    if (hasReachedPlanLimit()) {
      setIsSubscriptionModalOpen(true);
      return;
    }

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, { title: newTitle });

      setState(prev => ({
        ...prev,
        challenges: prev.challenges.map(challenge =>
          challenge.id === challengeId
            ? { ...challenge, title: newTitle }
            : challenge
        ),
        currentChallenge: prev.currentChallenge?.id === challengeId
          ? { ...prev.currentChallenge, title: newTitle }
          : prev.currentChallenge,
      }));
    } catch (error) {
      console.error('Error renaming challenge:', error);
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, { deleted: true });

      setState(prev => ({
        ...prev,
        challenges: prev.challenges.filter(challenge => challenge.id !== challengeId),
        currentChallenge: prev.currentChallenge?.id === challengeId ? null : prev.currentChallenge,
        messages: prev.currentChallenge?.id === challengeId ? [] : prev.messages,
      }));
    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !state.currentChallenge || !currentUser) return;

    if (hasReachedPlanLimit()) {
      setIsSubscriptionModalOpen(true);
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      isHtml: false,
    };

    try {
      // Save user message to messages collection
      await addDoc(collection(db, 'messages'), {
        ...userMessage,
        challengeId: state.currentChallenge.id,
        userEmail: currentUser.email,
      });

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        challenges: prev.challenges.map(challenge =>
          challenge.id === prev.currentChallenge?.id
            ? { ...challenge, messages: [...(challenge.messages || []), userMessage] }
            : challenge
        ),
      }));

      // Auto scroll to bottom
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      // Send message to webhook
      const response = await sendMessageToWebhook(content, state.currentChallenge.sessionId);
      const isHtml = response.trim().startsWith('<') && response.trim().endsWith('>');
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        isHtml,
      };

      // Check if response contains startup cards
      if (response.includes('<startup cards>')) {
        // Save startup list to startupLists collection
        await addDoc(collection(db, 'startupLists'), {
          content: response,
          userEmail: currentUser.email,
          userId: currentUser.uid,
          timestamp: new Date(),
          challengeId: state.currentChallenge.id,
        });

        // Update counter
        const countersRef = collection(db, 'counters');
        const counterQuery = query(countersRef, where('userId', '==', currentUser.uid));
        const counterSnapshot = await getDocs(counterQuery);

        if (counterSnapshot.empty) {
          await addDoc(countersRef, {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            count: 1
          });
          setState(prev => ({ ...prev, startupListCount: 1 }));
        } else {
          const counterDoc = counterSnapshot.docs[0];
          await updateDoc(doc(db, 'counters', counterDoc.id), {
            count: increment(1)
          });
          setState(prev => ({ ...prev, startupListCount: (prev.startupListCount || 0) + 1 }));
        }

        // Save a reference message to messages collection
        const referenceMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Lista de startups gerada com sucesso! Clique para visualizar.',
          timestamp: new Date(),
          isHtml: false,
        };

        await addDoc(collection(db, 'messages'), {
          ...referenceMessage,
          challengeId: state.currentChallenge.id,
          userEmail: currentUser.email,
          isStartupList: true,
          startupListId: uuidv4(), // Reference ID for the startup list
        });

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, referenceMessage],
          isLoading: false,
        }));
      } else {
        // Save regular assistant message to messages collection
        await addDoc(collection(db, 'messages'), {
          ...assistantMessage,
          challengeId: state.currentChallenge.id,
          userEmail: currentUser.email,
        });

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      }

      // Auto scroll to bottom
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      console.error('Error in message handling:', error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
        isHtml: false,
      };

      // Save error message
      await addDoc(collection(db, 'messages'), {
        ...errorMessage,
        challengeId: state.currentChallenge.id,
        userEmail: currentUser.email,
      });

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
        challenges: prev.challenges.map(challenge =>
          challenge.id === prev.currentChallenge?.id
            ? { ...challenge, messages: [...(challenge.messages || []), errorMessage] }
            : challenge
        ),
      }));

      // Auto scroll to bottom
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    challenges: state.challenges,
    currentChallenge: state.currentChallenge,
    startupListCount: state.startupListCount,
    isSubscriptionModalOpen,
    setIsSubscriptionModalOpen,
    sendMessage,
    createNewChallenge,
    selectChallenge,
    renameChallenge,
    deleteChallenge,
    hasReachedPlanLimit,
  };
};

export default useChat;
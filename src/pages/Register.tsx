import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, sendEmailVerification } from '../services/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SUBSCRIPTION_PLANS } from '../types';

const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  company: z.string().min(2, 'Empresa é obrigatória'),
  subscriptionPlan: z.enum(['padawan', 'jedi', 'mestre-jedi', 'adm-universo'] as const),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos de uso'
  }),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [isDeletedAccountModalOpen, setIsDeletedAccountModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues, setError: setFormError } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      subscriptionPlan: 'padawan'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      try {
        await sendEmailVerification(user);
      } catch (verificationError) {
        console.error('Error sending verification email:', verificationError);
      }

      await setDoc(doc(db, 'users', user.uid), {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        company: data.company,
        subscriptionPlan: data.subscriptionPlan,
        createdAt: new Date().toISOString(),
        isDeleted: false
      });

      await setDoc(doc(collection(db, 'plans')), {
        userId: user.uid,
        email: data.email,
        planType: data.subscriptionPlan,
        createdAt: new Date(),
        active: true
      });

      setVerificationEmailSent(true);
      setError('');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado. Por favor, faça login ou use um email diferente.');
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    }
  };

  if (verificationEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4">
        <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-lg text-white">
          <h2 className="text-2xl font-bold mb-4">Verifique seu Email</h2>
          <p className="mb-4">
            Um email de verificação foi enviado para o seu endereço de email.
            Por favor, verifique sua caixa de entrada e spam.
          </p>
          <p className="mb-4">
            Após verificar seu email, você poderá fazer login.
          </p>
          <Link
            to="/login"
            className="block w-full text-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg text-white">
        <div>
          <img
            src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png"
            alt="Gen.Oi Logo"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Criar Conta
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Nome Completo
              </label>
              <input
                {...register('fullName')}
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Celular
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-1">
                CPF
              </label>
              <input
                {...register('cpf')}
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.cpf && (
                <p className="text-red-400 text-sm mt-1">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                Empresa
              </label>
              <input
                {...register('company')}
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.company && (
                <p className="text-red-400 text-sm mt-1">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-300 mb-1">
                Plano de Assinatura
              </label>
              <select
                {...register('subscriptionPlan')}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                  <option key={key} value={key}>
                    {plan.name} - {plan.description}
                  </option>
                ))}
              </select>
              {errors.subscriptionPlan && (
                <p className="text-red-400 text-sm mt-1">{errors.subscriptionPlan.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar Senha
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                {...register('acceptTerms')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
              />
              <label className="ml-2 block text-sm text-gray-300">
                Li e aceito os{' '}
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  termos de uso
                </button>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-400 text-sm mt-1">{errors.acceptTerms.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Criar Conta
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>

      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Termos de Uso</h3>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="prose prose-invert max-w-none">
              <h4>1. Aceitação dos Termos</h4>
              <p>
                Ao acessar e usar o Gen.Oi, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
              </p>

              <h4>2. Uso do Serviço</h4>
              <p>
                O Gen.Oi é uma plataforma de inovação aberta que conecta empresas a startups.
                Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos.
              </p>

              <h4>3. Privacidade</h4>
              <p>
                Suas informações pessoais serão tratadas de acordo com nossa Política de Privacidade.
                Ao usar o serviço, você concorda com a coleta e uso de informações conforme descrito.
              </p>

              <h4>4. Propriedade Intelectual</h4>
              <p>
                Todo o conteúdo disponível no Gen.Oi, incluindo textos, gráficos, logos, ícones,
                imagens, clips de áudio, downloads digitais e compilações de dados é propriedade
                do Gen.Oi ou seus licenciadores e está protegido por leis de direitos autorais.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
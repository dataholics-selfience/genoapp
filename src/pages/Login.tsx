import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { sendPasswordResetEmail } from '../services/firebase';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      const errorCode = err?.code || err?.message;
      
      switch (errorCode) {
        case 'auth/account-deleted':
          setError('Esta conta foi excluída e não pode ser acessada.');
          break;
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Email ou senha incorretos. Por favor, verifique suas credenciais.');
          break;
        case 'auth/user-disabled':
          setError('Esta conta foi desativada. Entre em contato com o suporte.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas de login. Por favor, tente novamente mais tarde.');
          break;
        case 'auth/email-not-verified':
          setVerificationEmailSent(true);
          setError('Por favor, verifique seu email antes de fazer login. Um novo email de verificação foi enviado.');
          break;
        default:
          setError('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
      }
    }
  };

  const handlePasswordReset = async (email: string) => {
    if (!email) {
      setError('Por favor, insira seu email para redefinir a senha.');
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setResetEmailSent(true);
      setError(''); // Clear any previous errors
    } catch (err: any) {
      const errorCode = err?.code || err?.message;
      
      if (errorCode === 'auth/user-not-found') {
        setError('Não existe uma conta com este email.');
      } else {
        setError('Erro ao enviar email de recuperação. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 rounded-lg shadow-lg text-white">
        <div>
          <img
            src="https://genoi.net/wp-content/uploads/2024/12/Logo-gen.OI-Novo-1-2048x1035.png"
            alt="Gen.Oi Logo"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Login
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
              <div className="mb-2">{error}</div>
              {verificationEmailSent && (
                <p className="text-sm">
                  Verifique sua caixa de entrada e spam. Se não recebeu o email,{' '}
                  <button
                    type="button"
                    onClick={() => handlePasswordReset(getValues('email'))}
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    clique aqui para reenviar
                  </button>
                </p>
              )}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                {...register('email')}
                type="email"
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                {...register('password')}
                type="password"
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Esqueceu sua senha?
            </button>
            <Link
              to="/register"
              className="text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Criar conta
            </Link>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Entrar
          </button>
        </form>
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4 text-white">Recuperar Senha</h3>
            {resetEmailSent ? (
              <div>
                <p className="text-green-400 mb-4">
                  Email de recuperação enviado! Verifique sua caixa de entrada e pasta de spam.
                </p>
                <button
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetEmailSent(false);
                  }}
                  className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition duration-150 ease-in-out"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 mb-4">
                  Digite seu email abaixo para receber um link de recuperação de senha.
                </p>
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-3 py-2 border border-gray-700 bg-gray-800 rounded-md mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={getValues('email')}
                  {...register('email')}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setError(''); // Clear any errors when closing
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition duration-150 ease-in-out"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handlePasswordReset(getValues('email'))}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
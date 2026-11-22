import React, { useState } from 'react';
import { HeartPulse, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { authenticateNutriologist } from '../utils/authNutriologists';

interface LoginViewProps {
  onLoginSuccess: (user: {
    username: string;
    name: string;
    role: string;
    professionalLicense?: string;
    email?: string;
    authProvider?: 'local';
  }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const match = authenticateNutriologist(username, password);
      if (match) {
        onLoginSuccess({
          username: match.username,
          name: match.name,
          role: match.role === 'admin' ? 'Administrador Clínico' : 'Nutriólogo Clínico',
          professionalLicense: match.professionalLicense,
          email: match.email,
          authProvider: 'local',
        });
      } else {
        setErrorMsg('Usuario o contraseña incorrectos. Verifica tus credenciales de acceso clínico.');
        setIsLoading(false);
      }
    }, 250);
  };



  const handleFillDemo = () => {
    setUsername('alejandro');
    setPassword('aguilar1');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Clinic Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-900/40 mb-4 ring-4 ring-teal-500/20">
            <HeartPulse className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            NutriClinical <span className="text-teal-400">PRO</span>
          </h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
            Portal de Nutrición Clínica & Valoración Antropométrica
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100/10">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Acceso a Expedientes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresa tus credenciales profesionales para acceder al sistema clínico.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}



          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Usuario Profesional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="alejandro"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-teal-400 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Verificando credenciales...' : 'Iniciar Sesión'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Helper button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Acceso restringido</span>
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-teal-700 hover:text-teal-800 font-semibold cursor-pointer underline text-[11px]"
            >
              Autocompletar credenciales
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          NutriClinical PRO · Sistema Privado de Expedientes Clínicos
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  HeartPulse,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Award,
  Sparkles,
  ArrowRight,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  Apple,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { authenticateNutriologist } from '../utils/authNutriologists';
import { GoogleSignInButton } from './GoogleSignInButton';
import { googleSignIn } from '../utils/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';

interface PublicLandingViewProps {
  onLoginSuccess: (user: {
    username: string;
    name: string;
    role: string;
    professionalLicense?: string;
    email?: string;
    photoURL?: string;
    authProvider?: 'local' | 'google';
  }, googleAuth?: { user: FirebaseUser; accessToken: string }) => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onLoginSuccess }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Patient Appointment Request Form
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [consultationType, setConsultationType] = useState('Primera Vez / Valoración Integral');
  const [patientMessage, setPatientMessage] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
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
        setErrorMsg('Usuario o contraseña incorrectos.');
        setIsLoading(false);
      }
    }, 250);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        const gUser = res.user;
        const emailKey = (gUser.email || gUser.uid).replace(/[^a-zA-Z0-9._-]/g, '_');
        onLoginSuccess(
          {
            username: emailKey,
            name: gUser.displayName || 'Lic. Alejandro Castro',
            role: 'Nutriólogo Clínico · Google Drive',
            professionalLicense: 'Céd. Prof. 11995820',
            email: gUser.email || undefined,
            photoURL: gUser.photoURL || undefined,
            authProvider: 'google',
          },
          res
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'No se pudo iniciar sesión con Google. Verifica el permiso emergente.'
      );
      setIsLoading(false);
    }
  };

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = 'ln.alejandro.castro@gmail.com';
    const subject = encodeURIComponent(`Nueva Solicitud de Cita Nutricional - ${patientName}`);
    const body = encodeURIComponent(
      `Estimado Lic. Alejandro Aguilar,\n\nSe ha recibido una nueva solicitud de cita a través del portal web del consultorio:\n\n` +
        `- Nombre del Paciente: ${patientName}\n` +
        `- Correo Electrónico: ${patientEmail}\n` +
        `- Teléfono / WhatsApp: ${patientPhone}\n` +
        `- Fecha Deseada: ${appointmentDate || 'Por definir'}\n` +
        `- Tipo de Consulta: ${consultationType}\n` +
        `- Motivo / Observaciones: ${patientMessage || 'Ninguna'}\n\n` +
        `Por favor contactar al paciente para confirmar la cita.\n\nAtentamente,\nSistema de Citas en Línea - NutriClinical`
    );

    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header & Navigation */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">NutriClinical</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">PRO</span>
              </div>
              <p className="text-[11px] text-slate-400">Consultorio de Nutrición Clínica & Dietoterapia</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#contacto"
              className="hidden sm:inline-flex text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Solicitar Cita
            </a>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-900/40 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso al Sistema (Login)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-slate-900 via-slate-800 to-teal-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Especialista Certificado en Nutrición Clínica & Metabólica</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Transforma tu Salud con <span className="text-teal-400">Nutrición Basada en Evidencia</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Planes de alimentación personalizados, ajuste metabólico clínico para patologías, soporte nutricional especializado y tecnología de vanguardia para alcanzar tus metas de bienestar.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#contacto"
                  className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-900/50 transition inline-flex items-center gap-2"
                >
                  <span>Agendar Cita en Línea</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#servicios"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition"
                >
                  Conocer Servicios
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800 text-slate-400 text-xs font-semibold">
                <div>
                  <div className="text-2xl font-black text-white">+10 Años</div>
                  <div>Experiencia Clínica</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-teal-400">100%</div>
                  <div>Planes a la Medida</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">ESPEN/ADA</div>
                  <div>Guías Clínicas</div>
                </div>
              </div>
            </div>

            {/* Clinician Profile Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    AC
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Lic. Alejandro Castro</h3>
                    <p className="text-xs text-teal-400 font-semibold">Nutriólogo Clínico Titular</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Céd. Prof. 11995820</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Especialista en Obesidad y Síndrome Metabólico</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dietoterapia Renal, Hepática & Diabetes</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Soporte Nutricional Enteral y Parenteral</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>Consultorio Especializado</span>
                  </span>
                  <a href="#contacto" className="text-teal-400 font-bold hover:underline">
                    Ver disponibilidad &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">Servicios Clínicos Especializados</h2>
            <h3 className="text-3xl font-black text-white">Atención Nutricional Integral</h3>
            <p className="text-sm text-slate-400">
              Cada etapa y condición de salud requiere una estrategia nutricional precisa respaldada por guías internacionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Ajuste Metabólico & Patologías</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manejo nutricional clínico para diabetes, hipertensión, dislipidemias, esteatosis hepática, insuficiencia renal y enfermedades raras.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Apple className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Planes de Alimentación & SMAE</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dietas personalizadas por equivalentes (SMAE), menús variados semanales con listas de súper y análisis de macronutrientes adaptados a tus gustos.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/50 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">Soporte Nutricio Especializado</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prescripción de nutrición enteral (fórmulas comerciales y licuados artesanales) y nutrición parenteral total para pacientes hospitalizados o domiciliarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Request Form Section */}
      <section id="contacto" className="py-20 bg-gradient-to-t from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Solicita tu Cita Nutricional</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Llena el formulario y enviaremos tu solicitud directamente al correo del consultorio (<b className="text-teal-400">ln.alejandro.castro@gmail.com</b>). Nos pondremos en contacto contigo a la brevedad.
              </p>
            </div>

            {requestSent && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>¡Solicitud generada correctamente! Se abrió tu aplicación de correo para enviar la petición a ln.alejandro.castro@gmail.com.</span>
              </div>
            )}

            <form onSubmit={handleAppointmentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full font-semibold border border-slate-700 rounded-xl p-3 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full font-semibold border border-slate-700 rounded-xl p-3 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+52 55 0000 0000"
                    className="w-full font-semibold border border-slate-700 rounded-xl p-3 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Fecha Deseada</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full font-semibold border border-slate-700 rounded-xl p-3 bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 uppercase block mb-1">Tipo de Consulta</label>
                  <select
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value)}
                    className="w-full font-semibold border border-slate-700 rounded-xl p-3 bg-slate-900 text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Primera Vez / Valoración Integral">Primera Vez / Valoración Integral</option>
                    <option value="Consulta de Seguimiento">Consulta de Seguimiento</option>
                    <option value="Ajuste Metabólico por Patología">Ajuste Metabólico por Patología</option>
                    <option value="Soporte Nutricional Enteral/Parenteral">Soporte Nutricional Enteral / Parenteral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1">Motivo de Consulta u Observaciones</label>
                <textarea
                  rows={3}
                  value={patientMessage}
                  onChange={(e) => setPatientMessage(e.target.value)}
                  placeholder="Cuéntanos brevemente tus objetivos de salud o patologías diagnosticadas..."
                  className="w-full font-medium border border-slate-700 rounded-xl p-3 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-xl shadow-teal-900/50 transition cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Enviar Solicitud de Cita a ln.alejandro.castro@gmail.com</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-center text-[10px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div>
            <b>NutriClinical Pro</b> · Consultorio del Lic. Alejandro Castro (ln.alejandro.castro@gmail.com)
          </div>
          <div className="flex justify-center gap-4 text-slate-600">
            <button onClick={() => alert('Terminos y Condiciones:\n\nSus datos están protegidos conforme a las leyes vigentes de protección de datos personales. Al utilizar este sistema, usted acepta de manera voluntaria y expresa compartir su información con el Lic. Alejandro Castro para los fines exclusivos de su atención clínica y seguimiento nutricional.')} className="hover:text-teal-500 cursor-pointer">Términos y Condiciones</button>
            <button onClick={() => alert('Aviso de Privacidad:\n\nSus datos personales son tratados con estricta confidencialidad. NutriClinical Pro garantiza la seguridad de su información clínica conforme a la normativa aplicable.')} className="hover:text-teal-500 cursor-pointer">Aviso de Privacidad</button>
            <button onClick={() => alert('Nota sobre Inteligencia Artificial:\n\nEste sitio web y sus capacidades de análisis nutricional, generación de menús y reportes clínicos han sido desarrollados con asistencia de Inteligencia Artificial (IA) para optimizar la precisión y eficiencia en su atención médica.')} className="hover:text-teal-500 cursor-pointer">Desarrollo con IA</button>
          </div>
          <div className="text-slate-600">
            Todos los derechos reservados · Software clínico y portal de pacientes
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 relative">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white mb-3 shadow-lg shadow-teal-900/40">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">Acceso al Sistema Clínico</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa tus credenciales profesionales para gestionar expedientes y pacientes.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1.5">Usuario Profesional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                    className="w-full pl-9 pr-3 py-3 text-sm border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 uppercase block mb-1.5">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
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
                    className="w-full pl-9 pr-10 py-3 text-sm border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Verificando...' : 'Entrar al Sistema Clínico'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                o accede con tu cuenta Google
              </span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            <div className="space-y-2">
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                disabled={isLoading}
                label="Iniciar sesión con Google (Google Drive)"
                className="w-full"
              />
              <p className="text-[11px] text-center text-slate-400">
                Conecta Google Drive para guardar y extraer tus pacientes desde cualquier computadora.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

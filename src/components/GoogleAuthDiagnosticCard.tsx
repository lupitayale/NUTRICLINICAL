import React, { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  Globe,
  Users,
} from 'lucide-react';
import {
  FIREBASE_PROJECT_ID,
  GOOGLE_CREDENTIALS_URL,
  OAUTH_CONSENT_URL,
  getCurrentOrigin,
} from '../utils/googleAuth';

interface GoogleAuthDiagnosticCardProps {
  errorType?: 'origin-mismatch' | 'unauthorized-domain' | 'access-denied' | 'general';
  onRetry?: () => void;
  compact?: boolean;
  dark?: boolean;
}

export const GoogleAuthDiagnosticCard: React.FC<GoogleAuthDiagnosticCardProps> = ({
  errorType = 'origin-mismatch',
  onRetry,
  compact = false,
  dark = false,
}) => {
  const [copied, setCopied] = useState(false);
  const origin = getCurrentOrigin();
  const isOriginMismatch = errorType === 'origin-mismatch';

  const handleCopyOrigin = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  if (compact) {
    return (
      <div
        className={`rounded-xl border p-4 text-xs space-y-3 ${
          dark
            ? 'bg-amber-500/10 border-amber-400/30 text-amber-100'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <ShieldAlert
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              dark ? 'text-amber-300' : 'text-amber-600'
            }`}
          />
          <div className="space-y-1">
            <p className="font-bold text-sm">
              {isOriginMismatch
                ? `Falta registrar el origen "${origin}"`
                : 'Acceso multi-nutriólogo con Google Drive'}
            </p>
            <p className={`leading-relaxed ${dark ? 'text-amber-200/90' : 'text-amber-800'}`}>
              Para que cualquier nutriólogo pueda conectar su propia cuenta de Google Drive, registra el origen <code className="font-bold">{origin}</code> en Google Cloud y publica la app en modo En Producción.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleCopyOrigin(origin)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '¡Copiado!' : `Copiar: ${origin}`}</span>
          </button>

          <a
            href={GOOGLE_CREDENTIALS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Cloud Credentials</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 space-y-4 shadow-2xs">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h4 className="text-sm font-bold text-amber-950">
            Configuración para Uso Multi-Nutriólogo con Google Drive
          </h4>
          <p className="text-amber-800 leading-relaxed">
            NutriClinical Pro permite que <b>cualquier nutriólogo</b> conecte su propia cuenta de Google Drive para respaldar y extraer sus pacientes de forma independiente. Para que Google permita iniciar sesión a cualquier nutriólogo sin restricciones de prueba, realiza estos 2 sencillos pasos en Google Cloud Console:
          </p>
        </div>
      </div>

      <div className="bg-white/90 rounded-xl p-4 border border-amber-200/80 space-y-3 text-amber-900">
        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
          Paso 1: Registrar el origen web ({origin})
        </div>
        <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
          <li>
            Copia tu origen web exacto: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-bold text-amber-950">{origin}</code>
          </li>
          <li>
            Abre <b>Google Cloud Credentials</b> (botón abajo), haz clic en tu ID de cliente OAuth Web y en <b>Orígenes de JavaScript autorizados</b> añade <code className="font-bold">{origin}</code>. Guarda los cambios.
          </li>
        </ol>

        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800 pt-2 border-t border-amber-100">
          Paso 2: Permitir cualquier cuenta de Google (Modo Producción)
        </div>
        <ol className="list-decimal list-inside space-y-1.5 leading-relaxed" start={3}>
          <li>
            Abre la <b>Pantalla de consentimiento OAuth</b> en Google Cloud Console (botón abajo).
          </li>
          <li>
            Si el estado de publicación dice <b>En pruebas (Testing)</b>, haz clic en el botón <b>Publicar aplicación (Publish app)</b>. Esto permite que cualquier nutriólogo conecte su cuenta de Google Drive sin requerir lista previa de usuarios de prueba.
          </li>
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => handleCopyOrigin(origin)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold transition cursor-pointer shadow-2xs"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-amber-700" />
          )}
          <span>{copied ? '¡Origen copiado!' : `Copiar "${origin}"`}</span>
        </button>

        <a
          href={GOOGLE_CREDENTIALS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
        >
          <Globe className="w-4 h-4" />
          <span>Google Cloud Credentials</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href={OAUTH_CONSENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-xs"
        >
          <Users className="w-4 h-4" />
          <span>Pantalla Consentimiento OAuth (Publicar App)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar Conexión</span>
          </button>
        )}
      </div>
    </div>
  );
};

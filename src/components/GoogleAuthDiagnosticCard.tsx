import React, { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import {
  FIREBASE_PROJECT_ID,
  GOOGLE_CREDENTIALS_URL,
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
                ? `Error 400: origin_mismatch (${origin})`
                : 'Acceso bloqueado por Google OAuth'}
            </p>
            <p className={`leading-relaxed ${dark ? 'text-amber-200/90' : 'text-amber-800'}`}>
              {isOriginMismatch
                ? `Debes registrar "${origin}" como Origen de JavaScript autorizado en tus credenciales de Google Cloud (proyecto ${FIREBASE_PROJECT_ID}).`
                : 'Verifica los permisos y configuración de Google Cloud Console.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isOriginMismatch && (
            <>
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
            </>
          )}

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
            {isOriginMismatch
              ? `Acceso Bloqueado: Error 400 origin_mismatch para "${origin}"`
              : 'Acceso Bloqueado por Google OAuth'}
          </h4>
          <p className="text-amber-800 leading-relaxed">
            {isOriginMismatch
              ? `Google requiere que cualquier dominio web que ejecute Google Sign-In esté explícitamente registrado como "Origen de JavaScript autorizado" en las credenciales OAuth 2.0 del proyecto (${FIREBASE_PROJECT_ID}).`
              : 'Verifica la configuración de credenciales en Google Cloud Console.'}
          </p>
        </div>
      </div>

      <div className="bg-white/90 rounded-xl p-4 border border-amber-200/80 space-y-2.5 text-amber-900">
        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
          Pasos rápidos para registrar tu origen en Google Cloud:
        </div>
        <ol className="list-decimal list-inside space-y-2 leading-relaxed">
          <li>
            Copia la URL exacta de tu origen: <code className="bg-amber-100 px-1 py-0.5 rounded font-bold text-amber-950">{origin}</code>
          </li>
          <li>
            Haz clic en el botón de abajo para abrir las <b>Credenciales OAuth 2.0</b> en Google Cloud Console.
          </li>
          <li>
            Haz clic en tu ID de cliente OAuth Web (o créalo si no existe).
          </li>
          <li>
            En la sección <b>Orígenes de JavaScript autorizados (Authorized JavaScript origins)</b>, haz clic en <b>Agregar URI</b> y pega: <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">{origin}</code>
          </li>
          <li>
            Haz clic en <b>Guardar</b>, regresa aquí y presiona <b>Reintentar conexión con Google</b>.
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
          <span>Abrir Google Cloud Credentials</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reintentar conexión con Google</span>
          </button>
        )}
      </div>
    </div>
  );
};

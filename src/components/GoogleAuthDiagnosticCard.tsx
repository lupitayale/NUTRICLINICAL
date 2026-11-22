import React, { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  FIREBASE_AUTHORIZED_DOMAINS_URL,
  FIREBASE_PROJECT_ID,
  OAUTH_CONSENT_URL,
  getCurrentHostname,
} from '../utils/googleAuth';

interface GoogleAuthDiagnosticCardProps {
  errorType?: 'unauthorized-domain' | 'access-denied' | 'general';
  onRetry?: () => void;
  compact?: boolean;
  dark?: boolean;
}

export const GoogleAuthDiagnosticCard: React.FC<GoogleAuthDiagnosticCardProps> = ({
  errorType = 'access-denied',
  onRetry,
  compact = false,
  dark = false,
}) => {
  const [copied, setCopied] = useState(false);
  const hostname = getCurrentHostname() || 'nutriclinical.onrender.com';
  const isAccessDenied = errorType === 'access-denied';

  const handleCopyEmailOrDomain = async (text: string) => {
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
              {isAccessDenied
                ? 'Acceso bloqueado: Cuenta no añadida como Test User (Error 403)'
                : `Dominio no autorizado (${hostname})`}
            </p>
            <p className={`leading-relaxed ${dark ? 'text-amber-200/90' : 'text-amber-800'}`}>
              {isAccessDenied
                ? `Para permitir el acceso con Google Drive en modo de pruebas, agrega tu correo (ej. ln.alejandro.castro@gmail.com) en la sección "Test users" de Google Cloud Console (proyecto ${FIREBASE_PROJECT_ID}).`
                : `Agrega este dominio en Firebase Authentication → Configuración → Dominios autorizados del proyecto ${FIREBASE_PROJECT_ID}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isAccessDenied ? (
            <a
              href={OAUTH_CONSENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Añadir Test User en Google Cloud</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleCopyEmailOrDomain(hostname)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : `Copiar: ${hostname}`}</span>
              </button>
              <a
                href={FIREBASE_AUTHORIZED_DOMAINS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition"
              >
                <span>Abrir Firebase Dominios</span>
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
            {isAccessDenied
              ? 'Acceso Bloqueado: Cuenta no añadida como Usuario de Prueba (Error 403: access_denied)'
              : `Dominio no autorizado (${hostname})`}
          </h4>
          <p className="text-amber-800 leading-relaxed">
            {isAccessDenied
              ? `Google bloqueó el acceso porque el proyecto Firebase (${FIREBASE_PROJECT_ID}) está en modo de pruebas (Testing). Para permitir que tu cuenta (ej. ln.alejandro.castro@gmail.com) inicie sesión con Google Drive, debes agregarla a la lista de usuarios de prueba en Google Cloud Console.`
              : `Firebase bloqueó la ventana emergente porque el dominio activo (${hostname}) no está autorizado en la consola.`}
          </p>
        </div>
      </div>

      <div className="bg-white/90 rounded-xl p-4 border border-amber-200/80 space-y-2.5 text-amber-900">
        <div className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
          {isAccessDenied ? 'Pasos para autorizar tu correo en Google Cloud:' : `Pasos para autorizar ${hostname}:`}
        </div>
        <ol className="list-decimal list-inside space-y-2 leading-relaxed">
          {isAccessDenied ? (
            <>
              <li>
                Haz clic en el botón de abajo para abrir la <b>Pantalla de consentimiento OAuth</b> en Google Cloud Console.
              </li>
              <li>
                Desplázate hasta la sección <b>Usuarios de prueba (Test users)</b>.
              </li>
              <li>
                Haz clic en <b>Agregar usuarios (Add users)</b> e ingresa tu correo electrónico (ej. <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">ln.alejandro.castro@gmail.com</code>).
              </li>
              <li>
                Guarda los cambios, regresa aquí y presiona <b>Reintentar conexión con Google</b>.
              </li>
            </>
          ) : (
            <>
              <li>
                Copia el dominio exacto: <b>{hostname}</b>
              </li>
              <li>
                Abre <b>Firebase Console → Authentication → Settings → Authorized domains</b>.
              </li>
              <li>
                Haz clic en <b>Add domain</b>, pega <b>{hostname}</b>, guarda y reintenta.
              </li>
            </>
          )}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {isAccessDenied ? (
          <a
            href={OAUTH_CONSENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Agregar Test User en Google Cloud Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <a
            href={FIREBASE_AUTHORIZED_DOMAINS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
          >
            <span>Abrir Dominios Autorizados Firebase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

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

import { ClinicBrandingLogo } from '../types/nutrition';

export const LOGO_STORAGE_KEY = 'nutriclinical_selected_logo_v2';
export const CUSTOM_LOGO_STORAGE_KEY = 'nutriclinical_custom_logo_v2';

export const CLINIC_LOGOS: ClinicBrandingLogo[] = [
  {
    id: 'apple_gold_stethoscope',
    name: 'Sello Dorado & Manzana Médica',
    subtitle: 'Nutrición Clínica Especializada',
    accentColor: '#0d9488', // teal-600
    svgBadge: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#14b8a6" stroke-width="3"/>
      <circle cx="50" cy="50" r="41" stroke="#f59e0b" stroke-width="1" stroke-dasharray="2 2"/>
      <!-- Apple Silhouette -->
      <path d="M42 35 C32 35 24 45 24 58 C24 72 37 83 50 83 C63 83 76 72 76 58 C76 45 68 35 58 35 C52 35 50 40 50 40 C50 40 48 35 42 35 Z" fill="#0d9488"/>
      <!-- Leaf -->
      <path d="M50 35 C50 24 60 22 62 20 C62 30 54 34 50 35 Z" fill="#eab308"/>
      <!-- Medical Cross / Pulse inside apple -->
      <path d="M50 48 V68 M40 58 H60" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="58" r="1.5" fill="#fef08a"/>
    </svg>`,
  },
  {
    id: 'tree_of_life',
    name: 'Árbol de la Vida & Salud Holística',
    subtitle: 'Centro de Dietoterapia Integral',
    accentColor: '#059669', // emerald-600
    svgBadge: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#064e3b" stroke="#34d399" stroke-width="3"/>
      <!-- Tree Trunk -->
      <path d="M48 82 L48 56 C45 52 40 46 32 44 M52 82 L52 56 C55 52 60 46 68 44 M50 56 L50 38" stroke="#fde047" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Leaves / Fruit Circles -->
      <circle cx="50" cy="30" r="10" fill="#10b981"/>
      <circle cx="34" cy="38" r="9" fill="#34d399"/>
      <circle cx="66" cy="38" r="9" fill="#34d399"/>
      <circle cx="28" cy="52" r="7" fill="#6ee7b7"/>
      <circle cx="72" cy="52" r="7" fill="#6ee7b7"/>
      <circle cx="50" cy="45" r="5" fill="#fde047"/>
    </svg>`,
  },
  {
    id: 'wheat_sun_bio',
    name: 'Espiga Dorada & Sol Nutricional',
    subtitle: 'Metabolismo, Balance & Fibra',
    accentColor: '#d97706', // amber-600
    svgBadge: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
      <!-- Sun Rays -->
      <circle cx="50" cy="50" r="26" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 3"/>
      <!-- Stem -->
      <path d="M50 82 C50 60 50 35 50 25" stroke="#fef08a" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Wheat Grains -->
      <path d="M50 30 C43 27 42 35 50 37 C58 35 57 27 50 30 Z" fill="#f59e0b"/>
      <path d="M50 40 C41 37 40 46 50 48 C60 46 59 37 50 40 Z" fill="#d97706"/>
      <path d="M50 51 C39 48 38 58 50 60 C62 58 61 48 50 51 Z" fill="#f59e0b"/>
      <path d="M50 63 C40 60 39 69 50 71 C61 69 60 60 50 63 Z" fill="#b45309"/>
    </svg>`,
  },
  {
    id: 'modern_shield_vital',
    name: 'Escudo Vanguardia NutriClinical',
    subtitle: 'Evidencia Científica & Terapéutica',
    accentColor: '#0284c7', // sky-600
    svgBadge: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L82 22 V50 C82 70 50 88 50 88 C50 88 18 70 18 50 V22 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
      <!-- Inner Shield Gradient -->
      <path d="M50 18 L76 28 V50 C76 66 50 81 50 81 C50 81 24 66 24 50 V28 Z" fill="#0369a1" opacity="0.4"/>
      <!-- Pulse / Heart Rhythm -->
      <path d="M30 52 H40 L45 38 L55 64 L60 52 H70" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Small Star -->
      <circle cx="50" cy="30" r="3" fill="#ffffff"/>
    </svg>`,
  },
  {
    id: 'caduceus_leaf',
    name: 'Caduceo Clínico & Hoja Herbal',
    subtitle: 'Soporte Nutricio Especializado',
    accentColor: '#0f766e', // teal-700
    svgBadge: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#134e4a" stroke="#2dd4bf" stroke-width="3"/>
      <!-- Central Wand -->
      <line x1="50" y1="20" x2="50" y2="80" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="20" r="4.5" fill="#facc15"/>
      <!-- Entwining Plant Tendril/Serpent -->
      <path d="M32 35 C45 35 55 45 36 55 C22 62 48 72 50 78" stroke="#5eead4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M68 35 C55 35 45 45 64 55 C78 62 52 72 50 78" stroke="#5eead4" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Leaves -->
      <path d="M30 35 C22 30 25 22 35 25 C35 32 32 35 30 35 Z" fill="#a7f3d0"/>
      <path d="M70 35 C78 30 75 22 65 25 C65 32 68 35 70 35 Z" fill="#a7f3d0"/>
    </svg>`,
  },
];

export function getSelectedClinicLogo(): ClinicBrandingLogo {
  try {
    const savedId = localStorage.getItem(LOGO_STORAGE_KEY);
    if (savedId) {
      const found = CLINIC_LOGOS.find((l) => l.id === savedId);
      if (found) return found;
    }
  } catch (e) {
    console.warn('Error reading selected logo', e);
  }
  return CLINIC_LOGOS[0];
}

export function saveSelectedClinicLogo(logoId: string): void {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, logoId);
  } catch (e) {
    console.error('Error saving selected logo', e);
  }
}

export function getCustomLogoData(): string | null {
  try {
    return localStorage.getItem(CUSTOM_LOGO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveCustomLogoData(base64Image: string | null): void {
  try {
    if (base64Image) {
      localStorage.setItem(CUSTOM_LOGO_STORAGE_KEY, base64Image);
    } else {
      localStorage.removeItem(CUSTOM_LOGO_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error saving custom logo', e);
  }
}

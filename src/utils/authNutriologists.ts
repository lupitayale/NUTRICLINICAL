import { Nutriologist } from '../types/nutrition';

const NUTRIOLOGISTS_STORAGE_KEY = 'nutriclinical_nutriologists_v2';

export const INITIAL_NUTRIOLOGISTS: Nutriologist[] = [
  {
    id: 'nutri-1',
    username: 'alejandro',
    password: 'aguilar1',
    name: 'Lic. Alejandro Castro',
    professionalLicense: 'Céd. Prof. 11995820',
    specialty: 'Nutrición Clínica & Soporte Nutricional Metabólico',
    email: 'alexlokito@gmail.com',
    phone: '+52 (55) 4123-9876',
    role: 'admin',
    isActive: true,
    avatarInitials: 'AA',
    notes: 'Nutriólogo titular y administrador principal del centro clínico.',
    createdAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'nutri-2',
    username: 'sofia.m',
    password: 'nutri2026',
    name: 'Mtra. Sofía Mendoza Ramos',
    professionalLicense: 'Céd. Prof. 1092451',
    specialty: 'Nutrición Renal & Diabetes Mellitus',
    email: 'sofia.mendoza@nutriclinical.mx',
    phone: '+52 (55) 3490-1288',
    role: 'clinical_nutriologist',
    isActive: true,
    avatarInitials: 'SM',
    notes: 'Especialista en modulación de proteína y electrolitos en enfermedad renal.',
    createdAt: '2025-02-15T09:30:00.000Z',
  },
  {
    id: 'nutri-3',
    username: 'carlos.r',
    password: 'nutri2026',
    name: 'Dr. Carlos Rivas Valenzuela',
    professionalLicense: 'Céd. Prof. 9812403',
    specialty: 'Terapia Nutricional Enteral, Parenteral y Cuidados Críticos',
    email: 'carlos.rivas@nutriclinical.mx',
    phone: '+52 (55) 6789-4321',
    role: 'clinical_nutriologist',
    isActive: true,
    avatarInitials: 'CR',
    notes: 'Certificado en soporte nutricio artificial hospitalario y domiciliario.',
    createdAt: '2025-03-01T10:00:00.000Z',
  },
];

export function getStoredNutriologists(): Nutriologist[] {
  try {
    const raw = localStorage.getItem(NUTRIOLOGISTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read nutriologists from localStorage, using initial set', e);
  }
  return INITIAL_NUTRIOLOGISTS;
}

export function saveNutriologistsList(list: Nutriologist[]): void {
  try {
    localStorage.setItem(NUTRIOLOGISTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save nutriologists list to localStorage', e);
  }
}

export function authenticateNutriologist(
  usernameInput: string,
  passwordInput: string
): Nutriologist | null {
  const users = getStoredNutriologists();
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  // First check if matching user exists
  const match = users.find(
    (u) =>
      u.username.toLowerCase() === cleanUser &&
      (u.password === cleanPass || (!u.password && cleanPass === 'aguilar1')) &&
      u.isActive
  );

  if (match) return match;

  // Fallback for default credentials if custom list was cleared
  if (cleanUser === 'alejandro' && cleanPass === 'aguilar1') {
    return INITIAL_NUTRIOLOGISTS[0];
  }

  return null;
}

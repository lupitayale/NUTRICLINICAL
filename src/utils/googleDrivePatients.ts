import { Patient, ClinicalAppointment } from '../types/nutrition';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export const CLINIC_FOLDER_NAME = 'NutriClinical Pro - Expedientes';
export const FULL_BACKUP_FILENAME = 'NutriClinical_Base_Completa.json';

export interface DriveClinicFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  appProperties?: {
    nutriclinicalType?: 'patient_record' | 'full_backup';
    patientId?: string;
    patientName?: string;
    patientCount?: string;
  };
}

export interface FullClinicBackupPayload {
  schemaVersion: string;
  exportedAt: string;
  clinicianName: string;
  patients: Patient[];
  appointments: ClinicalAppointment[];
}

export interface IndividualPatientPayload {
  schemaVersion: string;
  exportedAt: string;
  clinicianName: string;
  patient: Patient;
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function handleDriveResponse(res: Response) {
  if (res.status === 401) {
    throw new Error('TOKEN_EXPIRED');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error de Google Drive (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/**
 * Finds the clinic folder in Google Drive (created by this app). Returns null if it does not exist yet.
 */
export async function findClinicFolder(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent(
    `name = '${CLINIC_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const res = await fetch(
    `${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name)&spaces=drive`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await handleDriveResponse(res);
  if (data?.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Finds or creates the dedicated clinic folder in Google Drive.
 */
export async function findOrCreateClinicFolder(accessToken: string): Promise<string> {
  const existingId = await findClinicFolder(accessToken);
  if (existingId) return existingId;

  const res = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: CLINIC_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Expedientes clínicos y respaldos de NutriClinical Pro',
    }),
  });
  const created = await handleDriveResponse(res);
  return created.id;
}

/**
 * Lists all NutriClinical Pro patient records and full backups stored in the clinic Drive folder.
 */
export async function listDriveClinicFiles(accessToken: string): Promise<{
  folderId: string | null;
  files: DriveClinicFile[];
}> {
  const folderId = await findClinicFolder(accessToken);
  if (!folderId) {
    return { folderId: null, files: [] };
  }

  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent(
    'files(id,name,mimeType,modifiedTime,size,webViewLink,appProperties)'
  );
  const res = await fetch(
    `${DRIVE_API_BASE}/files?q=${q}&fields=${fields}&orderBy=modifiedTime desc&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await handleDriveResponse(res);
  return {
    folderId,
    files: (data?.files || []) as DriveClinicFile[],
  };
}

/**
 * Uploads or updates a JSON file via multipart upload to Google Drive.
 */
async function uploadMultipartJson(
  accessToken: string,
  metadata: Record<string, any>,
  jsonContent: unknown,
  existingFileId?: string
): Promise<DriveClinicFile> {
  const boundary = `nutriclinical_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const bodyParts = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(jsonContent, null, 2),
    `--${boundary}--`,
  ];
  const multipartBody = bodyParts.join('\r\n');

  const url = existingFileId
    ? `${DRIVE_UPLOAD_BASE}/files/${existingFileId}?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink,appProperties`
    : `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink,appProperties`;

  const res = await fetch(url, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  return handleDriveResponse(res);
}

/**
 * Saves or updates a single patient's complete clinical record in Google Drive.
 */
export async function savePatientRecordToDrive(
  accessToken: string,
  folderId: string,
  patient: Patient,
  clinicianName: string,
  existingFileId?: string
): Promise<DriveClinicFile> {
  const fileName = `Expediente_${sanitizeFileName(patient.fullName)}_${patient.id}.json`;
  const payload: IndividualPatientPayload = {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    clinicianName,
    patient,
  };

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/json',
    description: `Expediente clínico nutricional de ${patient.fullName}`,
    appProperties: {
      nutriclinicalType: 'patient_record',
      patientId: patient.id,
      patientName: patient.fullName.slice(0, 100),
    },
  };

  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  return uploadMultipartJson(accessToken, metadata, payload, existingFileId);
}

/**
 * Saves or updates the full clinic database (all patients + appointments) in Google Drive.
 */
export async function saveFullClinicBackupToDrive(
  accessToken: string,
  folderId: string,
  patients: Patient[],
  appointments: ClinicalAppointment[],
  clinicianName: string,
  existingFileId?: string
): Promise<DriveClinicFile> {
  const payload: FullClinicBackupPayload = {
    schemaVersion: '1.0',
    exportedAt: new Date().toISOString(),
    clinicianName,
    patients,
    appointments,
  };

  const metadata: Record<string, any> = {
    name: FULL_BACKUP_FILENAME,
    mimeType: 'application/json',
    description: `Base completa de expedientes NutriClinical Pro (${patients.length} pacientes)`,
    appProperties: {
      nutriclinicalType: 'full_backup',
      patientCount: String(patients.length),
    },
  };

  if (!existingFileId) {
    metadata.parents = [folderId];
  }

  return uploadMultipartJson(accessToken, metadata, payload, existingFileId);
}

/**
 * Extracts (downloads & parses) a JSON file from Google Drive.
 */
export async function extractFileContentFromDrive(
  accessToken: string,
  fileId: string
): Promise<IndividualPatientPayload | FullClinicBackupPayload> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return handleDriveResponse(res);
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFileFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await handleDriveResponse(res);
}

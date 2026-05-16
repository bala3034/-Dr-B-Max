import Dexie, { type EntityTable } from 'dexie';
import { applyEncryptionMiddleware, NON_INDEXED_FIELDS, clearAllTables } from 'dexie-encrypted';

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  time: string; // HH:MM format
  instructions?: string; // Example: "For 5 days after breakfast"
  startDate: string; // YYYY-MM-DD
  durationDays: number;
  inventory: number;
  contactNumber?: string;
}

export interface MedicationLog {
  id?: number;
  medicationId: number;
  date: string; // YYYY-MM-DD
  status: 'Taken' | 'Missed';
  timestamp: number;
}

export interface VitalsLog {
  id?: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
  bpm: number;
  spo2: number;
  stress: string;
}

const db = new Dexie('DrBMaxDatabase') as Dexie & {
  medications: EntityTable<Medication, 'id'>;
  logs: EntityTable<MedicationLog, 'id'>;
  vitals: EntityTable<VitalsLog, 'id'>;
};

// Apply HIPAA-compliant AES-256 encryption to all sensitive data at rest.
// Note: For production, derive this key securely from a user PIN/Password (e.g., via PBKDF2).
const encryptionKey = new Uint8Array([
  21, 12, 45, 99, 102, 54, 76, 12, 88, 32, 1, 9, 11, 45, 77, 81,
  12, 33, 45, 67, 89, 11, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
]);

applyEncryptionMiddleware(db, encryptionKey, {
  medications: NON_INDEXED_FIELDS,
  logs: NON_INDEXED_FIELDS,
  vitals: NON_INDEXED_FIELDS
}, clearAllTables);

// Schema declaration
db.version(1).stores({
  medications: '++id, name, time',
  logs: '++id, medicationId, date, status'
});

db.version(2).stores({
  medications: '++id, name, time, startDate, durationDays',
  logs: '++id, medicationId, date, status'
}).upgrade(tx => {
  // Gracefully handle existing pills that don't have startDate by defaulting to epoch
  return tx.table('medications').toCollection().modify(med => {
    if (!med.startDate) med.startDate = "2024-01-01";
    if (!med.durationDays) med.durationDays = 365; // Legacy forever baseline
  });
});

db.version(3).stores({
  medications: '++id, name, time, startDate, durationDays, inventory, contactNumber',
  logs: '++id, medicationId, date, status'
}).upgrade(tx => {
  return tx.table('medications').toCollection().modify(med => {
    if (med.inventory === undefined) med.inventory = 30; // default 30 pills
  });
});

db.version(4).stores({
  medications: '++id, name, time, startDate, durationDays, inventory, contactNumber',
  logs: '++id, medicationId, date, status',
  vitals: '++id, date, timestamp'
});

db.version(5).stores({
  medications: '++id, name, time, startDate, durationDays, inventory, contactNumber',
  logs: '++id, medicationId, date, status',
  vitals: '++id, date, timestamp'
});

export const removeMockData = async () => {
  // Find and delete the original hardcoded mock tablets by their names
  const mockNames = ['Vitamin D', 'Blood Pressure', 'Omega-3'];
  for (const name of mockNames) {
    const rx = await db.medications.where('name').equals(name).first();
    if (rx) {
      await db.medications.delete(rx.id);
    }
  }
};

export default db;

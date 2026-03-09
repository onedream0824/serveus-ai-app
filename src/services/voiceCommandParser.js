const COMMANDS = {
  ON_MY_WAY: 'on_my_way',
  START_APPOINTMENT: 'start_appointment',
  COMPLETE_APPOINTMENT: 'complete_appointment',
  CREATE_PROOF_OF_WORK: 'create_proof_of_work',
  TAKE_PHOTO: 'take_photo',
  ADD_NOTE: 'add_note',
  ATTACH_LAST_PHOTO: 'attach_last_photo',
};

const PHRASES = [
  { command: COMMANDS.TAKE_PHOTO, patterns: ['take picture', 'take photo', 'take a picture', 'take a photo', 'capture photo'] },
];

const ATTACH_LAST_PHOTO_PATTERNS = [
  { regex: /\battach\s+last\s+two\s+photos?\s+(?:to\s+service\s+report)?$/i, count: 2 },
  { regex: /\battach\s+last\s+2\s+photos?\s+(?:to\s+service\s+report)?$/i, count: 2 },
  { regex: /\battach\s+last\s+photo\s+(?:to\s+service\s+report)?$/i, count: 1 },
  { regex: /\battach\s+last\s+1\s+photo\s+(?:to\s+service\s+report)?$/i, count: 1 },
];

const WITH_CUSTOMER_PATTERNS = [
  {
    command: COMMANDS.START_APPOINTMENT,
    prefixes: ['start appointment for', 'start appointment', 'start the appointment for', 'start the appointment', 'begin appointment for', 'begin appointment'],
  },
  {
    command: COMMANDS.ON_MY_WAY,
    prefixes: ["i'm on my way to", "i'm on my way", 'on my way to', 'on my way', 'im on my way to', 'im on my way', 'i am on my way to', 'i am on my way'],
  },
  {
    command: COMMANDS.COMPLETE_APPOINTMENT,
    prefixes: ['complete appointment for', 'complete appointment', 'finish appointment for', 'finish appointment', 'complete job for', 'complete job', 'finish job for', 'finish job'],
  },
  {
    command: COMMANDS.CREATE_PROOF_OF_WORK,
    prefixes: ['create service report for', 'create proof of work for', 'create service report', 'create proof of work'],
  },
];

const ADD_NOTE_PREFIXES = ['add note:', 'add note ', 'add note', 'note:', 'note '];

const CREATE_PROOF_PREFIXES = [
  'create service report: ',
  'create service report ',
  'create proof of work: ',
  'create proof of work ',
  'create proof: ',
  'create proof ',
  'proof of work: ',
  'proof of work ',
];

function normalize(t) {
  return (t || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function stripHeyMeta(transcript) {
  if (!transcript || typeof transcript !== 'string') return transcript ?? '';
  const t = transcript.trim();
  const lower = t.toLowerCase();
  const prefixes = ['hey meta, ', 'hey meta,', 'hey meta '];
  for (const p of prefixes) {
    if (lower.startsWith(p)) return t.slice(p.length).trim();
  }
  if (lower.startsWith('hey meta')) return t.slice(8).trim();
  return t;
}

export function findAppointmentIndexByCustomerName(appointments, query) {
  if (!Array.isArray(appointments) || !query || typeof query !== 'string') return -1;
  const q = normalize(query);
  if (!q) return -1;
  for (let i = 0; i < appointments.length; i++) {
    const name = (appointments[i].customerName || '').trim().toLowerCase();
    if (name.includes(q) || q.includes(name)) return i;
  }
  return -1;
}

export function parseTranscript(transcript) {
  const raw = (transcript || '').trim();
  const lower = normalize(raw);
  if (!lower) return null;

  for (const prefix of ADD_NOTE_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const rest = raw.slice(prefix.length).trim();
      return { command: COMMANDS.ADD_NOTE, noteText: rest || undefined };
    }
  }

  for (const prefix of CREATE_PROOF_PREFIXES) {
    if (lower.startsWith(prefix)) {
      const rest = raw.slice(prefix.length).trim();
      return { command: COMMANDS.CREATE_PROOF_OF_WORK, noteText: rest || undefined };
    }
  }
  if (lower === 'create proof of work' || lower === 'create proof' || lower === 'proof of work' || lower === 'create report' || lower === 'create service report' || lower === 'service report') {
    return { command: COMMANDS.CREATE_PROOF_OF_WORK };
  }

  for (const { regex, count } of ATTACH_LAST_PHOTO_PATTERNS) {
    if (regex.test(lower)) return { command: COMMANDS.ATTACH_LAST_PHOTO, count };
  }
  if (/\battach\s+last\s+photos?\s+(?:to\s+service\s+report)?$/i.test(lower)) {
    return { command: COMMANDS.ATTACH_LAST_PHOTO, count: 1 };
  }

  for (const { command, prefixes } of WITH_CUSTOMER_PATTERNS) {
    const sorted = [...prefixes].sort((a, b) => b.length - a.length);
    for (const prefix of sorted) {
      if (lower.startsWith(prefix)) {
        const rest = raw.slice(prefix.length).trim();
        if (rest) return { command, customerName: rest };
        return { command };
      }
    }
  }

  for (const { command, patterns } of PHRASES) {
    for (const p of patterns) {
      if (lower === p || lower.includes(p)) return { command };
    }
  }

  return null;
}

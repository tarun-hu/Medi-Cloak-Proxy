export function getApiBase() {
  // 1. User manual override stored in localStorage
  if (typeof window !== 'undefined' && localStorage.getItem('medicloak_api_url')) {
    const custom = localStorage.getItem('medicloak_api_url').replace(/\/$/, '');
    return custom.endsWith('/api') ? custom : `${custom}/api`;
  }
  // 2. Build-time injected VITE_API_URL
  const envApi = import.meta.env.VITE_API_URL;
  if (envApi && typeof envApi === 'string' && envApi !== 'undefined' && !envApi.includes('localhost')) {
    const clean = envApi.startsWith('http') ? envApi.replace(/\/$/, '') : `https://${envApi.replace(/\/$/, '')}`;
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  // 3. Dynamic cloud derivation on Render (*.onrender.com)
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    const backendHost = window.location.hostname.replace('medicloak-dashboard', 'medicloak-backend');
    return `https://${backendHost}/api`;
  }
  // 4. Default to local development backend
  return 'http://localhost:8000/api';
}

export async function fetchStats() {
  const res = await fetch(`${getApiBase()}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', params.limit);
  if (params.offset) query.set('offset', params.offset);
  if (params.severity) query.set('severity', params.severity);
  if (params.service) query.set('service', params.service);
  if (params.status) query.set('status', params.status);

  const res = await fetch(`${getApiBase()}/events?${query}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEvent(eventId) {
  const res = await fetch(`${getApiBase()}/events/${eventId}`);
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
}

export async function updateEventStatus(eventId, status) {
  const res = await fetch(`${getApiBase()}/events/${eventId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function deleteEvent(eventId, userRole = 'dpo') {
  const res = await fetch(`${getApiBase()}/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'x-user-role': userRole,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete event under DPDP Right to Erasure');
  }
  return res.json();
}

export async function requestErasure(patientIdentifier, reason = 'DPDP Section 12 Right to Erasure', eventId = null, userRole = 'dpo') {
  const res = await fetch(`${getApiBase()}/dpdp/erasure-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': userRole || 'dpo',
    },
    body: JSON.stringify({
      patient_identifier: patientIdentifier,
      reason,
      event_id: eventId,
    }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to submit formal DPDP erasure request');
  }
  return res.json();
}

export async function interceptVision(payload) {
  const res = await fetch(`${getApiBase()}/vision/intercept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Multi-modal vision interception failed');
  }
  return res.json();
}

export async function seedDatabase() {
  const res = await fetch(`${getApiBase()}/seed`, {
    method: 'POST',
    headers: { 'x-user-role': 'admin' },
  });
  if (!res.ok) throw new Error('Failed to seed database');
  return res.json();
}

export async function fetchCalls(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', params.limit);
  if (params.event_id) query.set('event_id', params.event_id);

  const res = await fetch(`${getApiBase()}/calls?${query}`);
  if (!res.ok) throw new Error('Failed to fetch calls');
  return res.json();
}

export async function fetchCallStats() {
  const res = await fetch(`${getApiBase()}/calls/stats`);
  if (!res.ok) throw new Error('Failed to fetch call stats');
  return res.json();
}

export async function triggerTestCall() {
  const res = await fetch(`${getApiBase()}/calls/test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger test call');
  return res.json();
}

export async function purgeAllAuditVault(userRole = 'dpo') {
  const res = await fetch(`${getApiBase()}/audit/purge-all`, {
    method: 'POST',
    headers: {
      'x-user-role': userRole || 'dpo',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to execute DPDP Vault Purge');
  }
  return res.json();
}

export async function fetchAudioBriefing(eventId, voiceId = 'adam', forceRefresh = false) {
  const res = await fetch(
    `${getApiBase()}/events/${eventId}/audio-briefing?voice_id=${voiceId}&force_refresh=${forceRefresh}`,
    { method: 'POST' }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate CISO audio briefing');
  }
  return res.json();
}

export async function fetchElevenLabsStatus() {
  const res = await fetch(`${getApiBase()}/elevenlabs/status`);
  if (!res.ok) throw new Error('Failed to fetch ElevenLabs status');
  return res.json();
}


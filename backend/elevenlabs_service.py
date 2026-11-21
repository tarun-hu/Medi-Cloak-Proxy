"""
MediCloak Sovereign Gateway - ElevenLabs CISO Voice Dispatch Service
Generates autonomous, low-latency tactical audio briefings for PHI exfiltration
interception events under DPDP Act 2023 & HIPAA Safe Harbor guidelines.
"""

import os
import json
import math
import struct
import wave
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv

# Curated ElevenLabs voices for Incident Command & Healthcare Compliance
CURATED_VOICES = {
    "adam": {
        "id": "pNInz6obpgDQGcFmaJgB",
        "name": "Adam (CISO Command)",
        "role": "Chief Information Security Officer",
        "style": "Deep, authoritative tactical voice",
        "gender": "male",
    },
    "rachel": {
        "id": "21m00Tcm4TlvDq8ikWAM",
        "name": "Rachel (Compliance Officer)",
        "role": "Data Protection Officer",
        "style": "Calm, precise regulatory compliance voice",
        "gender": "female",
    },
    "george": {
        "id": "JBFqnCBsd6RMkjVDRZzb",
        "name": "George (SOC Lead)",
        "role": "Healthcare SOC Operations Lead",
        "style": "Crisp, urgent technical operations voice",
        "gender": "male",
    },
}

AUDIO_STORAGE_DIR = Path(__file__).resolve().parent / "static_audio"
AUDIO_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


def get_api_key() -> str:
    """Retrieve ElevenLabs API key dynamically from environment or .env file."""
    # Check current process environment
    key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not key or not key.startswith("sk_"):
        # Dynamically reload from backend/.env or root .env so user edits take effect immediately
        backend_env = Path(__file__).resolve().parent / ".env"
        if backend_env.exists():
            load_dotenv(backend_env, override=True)
            key = os.getenv("ELEVENLABS_API_KEY", "").strip()
        if not key or not key.startswith("sk_"):
            root_env = Path(__file__).resolve().parent.parent / ".env"
            if root_env.exists():
                load_dotenv(root_env, override=True)
                key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    return key


def is_configured() -> bool:
    """Check if a valid ElevenLabs API key is configured (must start with sk_)."""
    key = get_api_key()
    return bool(key and key.startswith("sk_") and len(key) >= 20)


def get_voice_info(voice_key: str) -> dict:
    """Resolve a voice key ('adam', 'rachel', etc.) or custom ID."""
    key = voice_key.lower().strip()
    if key in CURATED_VOICES:
        return CURATED_VOICES[key]
    # Check if voice_key matches an ID directly
    for v in CURATED_VOICES.values():
        if v["id"] == voice_key:
            return v
    # Default to Adam
    return CURATED_VOICES["adam"]


def generate_incident_script(event: Dict[str, Any], voice_key: str = "adam") -> str:
    """
    Generate an authoritative CISO tactical incident briefing script
    tailored to the specific intercepted PHI event.
    """
    service = event.get("ai_service", "General LLM")
    dept = event.get("department", "Hospital Clinical Ward")
    risk_score = event.get("risk_score", 85)
    severity = str(event.get("severity", "CRITICAL")).upper()
    latency = event.get("latency_ms", 14.2)
    sha_hash = str(event.get("sha256_hash", "a7f9c2d1"))[:8]

    phi_types = event.get("phi_types", [])
    if isinstance(phi_types, str):
        try:
            phi_types = json.loads(phi_types)
        except Exception:
            phi_types = [phi_types]

    phi_count = len(phi_types)
    phi_str = ", ".join(phi_types[:4]) if phi_types else "Direct Patient Identifiers"

    # Tone varies by voice persona
    if voice_key == "rachel":
        # DPDP / Legal Compliance emphasis
        return (
            f"Regulatory Compliance Dispatch. MediCloak sovereign gateway has intercepted an unapproved transmission "
            f"from {dept} directed to {service}. "
            f"Under Section 8 and Section 12 of India's Digital Personal Data Protection Act 2023, "
            f"{phi_count} protected health elements were identified, specifically: {phi_str}. "
            f"Our zero-trust redaction pipeline neutralized all patient data in {latency} milliseconds, "
            f"preserving clinical diagnostic context while preventing unlawful data transfer. "
            f"Audit hash {sha_hash} has been sealed in the immutable compliance vault."
        )
    elif voice_key == "george":
        # Technical SOC emphasis
        return (
            f"SOC Alert. Severity {severity}, risk index {risk_score} out of 100. "
            f"Layer-7 transparent proxy triggered on outbound payload to {service} host. "
            f"In-flight inspection flagged {phi_count} unencrypted health identifiers: {phi_str}. "
            f"Threat neutralized. Reversible synthetic tokens injected in {latency} milliseconds. "
            f"Perimeter remains secure. Cryptographic record logged under ID {sha_hash}."
        )
    else:
        # Adam (CISO Command default)
        return (
            f"Security Advisory from MediCloak Sovereign Gateway. "
            f"At terminal {dept}, an outbound AI consultation was intercepted heading to {service}. "
            f"MediCloak identified {phi_count} protected health attributes including {phi_str}. "
            f"Under HIPAA Safe Harbor and India DPDP 2023 guidelines, all sensitive attributes were stripped "
            f"and replaced with zero-trust synthetic tokens in {latency} milliseconds. "
            f"Clinical semantic context was preserved for diagnostic accuracy. "
            f"Zero unprotected patient data breached the hospital DMZ. Sovereign audit signature {sha_hash} sealed."
        )


def _generate_alert_tone_wav(output_path: Path, duration_sec: float = 2.5) -> None:
    """
    Generates a futuristic high-tech CISO cyber alert chime WAV file.
    Uses pure standard library math/wave/struct - zero external dependencies!
    This ensures audio playback is 100% resilient even with zero API credits.
    """
    sample_rate = 44100
    num_samples = int(sample_rate * duration_sec)

    # Chime frequencies: Futuristic dual-tone Cyber Dispatch Arpeggio (880Hz, 1174Hz, 1760Hz)
    chimes = [
        (880.0, 0.0, 0.6),    # A5
        (1174.66, 0.25, 0.6), # D6
        (1760.0, 0.5, 1.8),   # A6
    ]

    samples = [0.0] * num_samples

    for freq, start_time, tone_dur in chimes:
        start_idx = int(sample_rate * start_time)
        dur_samples = int(sample_rate * tone_dur)
        for i in range(dur_samples):
            idx = start_idx + i
            if idx >= num_samples:
                break
            t = float(i) / sample_rate
            # Exponential decay envelope
            envelope = math.exp(-3.5 * (t / tone_dur))
            # Harmonic combination
            val = math.sin(2.0 * math.pi * freq * t) * 0.7 + math.sin(4.0 * math.pi * freq * t) * 0.3
            samples[idx] += val * envelope * 0.45

    # Clip and convert to 16-bit PCM
    pcm_data = bytearray()
    for s in samples:
        s_clamped = max(-1.0, min(1.0, s))
        val = int(s_clamped * 32767.0)
        pcm_data.extend(struct.pack("<h", val))

    with wave.open(str(output_path), "wb") as wav_file:
        wav_file.setnchannels(1)       # Mono
        wav_file.setsampwidth(2)       # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)


def synthesize_briefing_audio(
    event: Dict[str, Any],
    voice_key: str = "adam",
    force_refresh: bool = False,
) -> Dict[str, Any]:
    """
    Synthesizes CISO Voice Dispatch audio for a given event.
    1. Checks local cache for pre-synthesized audio.
    2. If ElevenLabs API key is present: invokes ElevenLabs REST API (Turbo v2.5 model).
    3. If ElevenLabs API is unavailable or key not set: generates cyber chime WAV + returns WebSpeech transcript.
    """
    event_id = str(event.get("id") or event.get("event_id") or "event_preview")
    voice_meta = get_voice_info(voice_key)
    voice_id = voice_meta["id"]
    voice_name = voice_meta["name"]

    script = generate_incident_script(event, voice_key=voice_key)

    # Cache filenames
    mp3_filename = f"ciso_briefing_{event_id}_{voice_key}.mp3"
    wav_filename = f"ciso_briefing_{event_id}_{voice_key}.wav"

    mp3_path = AUDIO_STORAGE_DIR / mp3_filename
    wav_path = AUDIO_STORAGE_DIR / wav_filename

    # If cached MP3 exists and not forced, return immediately
    if not force_refresh and mp3_path.exists() and mp3_path.stat().st_size > 500:
        return {
            "status": "success",
            "audio_url": f"/static/audio/{mp3_filename}",
            "filename": mp3_filename,
            "script": script,
            "voice_id": voice_id,
            "voice_name": voice_name,
            "provider": "elevenlabs_cached",
            "is_live_voice": True,
            "fallback_speech_text": script,
        }

    # Attempt ElevenLabs Live API synthesis if configured
    api_key = get_api_key()
    if api_key and is_configured():
        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"
            payload = {
                "text": script,
                "model_id": "eleven_turbo_v2_5",  # Fastest, ultra-low latency, free tier optimized
                "voice_settings": {
                    "stability": 0.55,
                    "similarity_boost": 0.75,
                    "style": 0.15,
                    "use_speaker_boost": True,
                },
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                audio_bytes = response.read()
                if len(audio_bytes) > 500:
                    with open(mp3_path, "wb") as f:
                        f.write(audio_bytes)
                    return {
                        "status": "success",
                        "audio_url": f"/static/audio/{mp3_filename}",
                        "filename": mp3_filename,
                        "script": script,
                        "voice_id": voice_id,
                        "voice_name": voice_name,
                        "provider": "elevenlabs_live_v2_5",
                        "is_live_voice": True,
                        "fallback_speech_text": script,
                    }
        except Exception as e:
            print(f"[ElevenLabs API Error]: {e} - Falling back to high-tech cyber alert synth", flush=True)

    # Resilient Fallback: Create high-tech cyber alert WAV tone + provide full transcript for browser WebSpeech
    if not wav_path.exists() or wav_path.stat().st_size == 0:
        _generate_alert_tone_wav(wav_path)

    key_is_id = bool(api_key and not api_key.startswith("sk_"))
    note = (
        "Notice: You copied the ElevenLabs Key ID instead of the Secret API Key. "
        "ElevenLabs API keys start with 'sk_'. Please create or copy a key starting with 'sk_'."
        if key_is_id else
        "Paste ELEVENLABS_API_KEY (starts with sk_) in .env to activate neural voice generation."
    )

    return {
        "status": "success",
        "audio_url": f"/static/audio/{wav_filename}",
        "filename": wav_filename,
        "script": script,
        "voice_id": voice_id,
        "voice_name": voice_name,
        "provider": "medicloak_cyber_synth",
        "is_live_voice": False,
        "fallback_speech_text": script,
        "note": note,
    }

import React, { useState, useEffect, useRef } from "react";
import {
  AlertOctagon,
  X,
  MapPin,
  PhoneCall,
  Share2,
  Volume2,
  VolumeX,
  ExternalLink,
  Copy,
  Check,
  Clock,
  RefreshCw,
  Navigation
} from "lucide-react";

export default function SafetyModeModal({ isOpen, onClose }) {
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Countdown timer state (default 30s SOS check-in)
  const [countdown, setCountdown] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerExpired, setTimerExpired] = useState(false);

  // Web Audio Siren state
  const [isSirenActive, setIsSirenActive] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sirenIntervalRef = useRef(null);

  // Share & Copy state
  const [copied, setCopied] = useState(false);

  // Get Geolocation
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date(pos.timestamp).toLocaleTimeString()
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setGeoError(
          err.code === 1
            ? "Location permission was denied. Please enable location access in browser settings to display live coordinates."
            : "Unable to retrieve precise location. Please check your GPS or network signal."
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger location on mount when modal opens
  useEffect(() => {
    if (isOpen) {
      requestLocation();
      setCountdown(30);
      setIsTimerRunning(true);
      setTimerExpired(false);
    } else {
      stopSiren();
    }
  }, [isOpen]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (isOpen && isTimerRunning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTimerRunning) {
      setTimerExpired(true);
      setIsTimerRunning(false);
      // Auto-trigger safety siren on zero countdown
      startSiren();
    }
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning, countdown]);

  // Web Audio Siren synthesizer
  const startSiren = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Modulate frequency to create oscillating emergency siren effect
      let freqHigh = true;
      sirenIntervalRef.current = setInterval(() => {
        if (oscillatorRef.current && audioCtxRef.current) {
          const now = audioCtxRef.current.currentTime;
          const targetFreq = freqHigh ? 1100 : 700;
          oscillatorRef.current.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.3);
          freqHigh = !freqHigh;
        }
      }, 350);

      setIsSirenActive(true);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    setIsSirenActive(false);
  };

  const toggleSiren = () => {
    if (isSirenActive) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  // Format SOS location message
  const getSosMessage = () => {
    if (coords) {
      const mapsUrl = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
      return `🚨 EMERGENCY ALERT via SafePulse: I feel unsafe and require assistance.\n📍 My Live GPS Location:\nLatitude: ${coords.latitude}, Longitude: ${coords.longitude} (Accuracy: ±${coords.accuracy}m)\n🔗 View on Google Maps: ${mapsUrl}\n⏰ Time: ${coords.timestamp}`;
    }
    return `🚨 EMERGENCY ALERT via SafePulse: I feel unsafe and require assistance. Please contact me immediately.`;
  };

  // Share Location via Web Share API or Clipboard Fallback
  const handleShareLocation = async () => {
    const message = getSosMessage();
    const mapsUrl = coords ? `https://maps.google.com/?q=${coords.latitude},${coords.longitude}` : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "🚨 SafePulse Emergency SOS Location",
          text: message,
          url: mapsUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Share API error, fallback to clipboard:", err);
        }
      }
    }

    // Fallback: Copy to clipboard
    handleCopyMessage();
  };

  const handleCopyMessage = () => {
    const message = getSosMessage();
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const resetTimer = (seconds = 30) => {
    setCountdown(seconds);
    setIsTimerRunning(true);
    setTimerExpired(false);
    stopSiren();
  };

  const handleCancelSafetyMode = () => {
    stopSiren();
    onClose();
  };

  if (!isOpen) return null;

  const mapsLink = coords ? `https://maps.google.com/?q=${coords.latitude},${coords.longitude}` : null;
  const osmLink = coords ? `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=16/${coords.latitude}/${coords.longitude}` : null;

  return (
    <div className="safety-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="safety-modal-card">
        {/* Header */}
        <div className="safety-modal-header">
          <div className="safety-modal-title" id="modal-title">
            <AlertOctagon size={26} strokeWidth={2.5} />
            <span>SAFETY MODE ACTIVATED</span>
          </div>
          <button
            className="btn-close-modal"
            onClick={handleCancelSafetyMode}
            aria-label="Close Safety Mode"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live GPS Coordinates Section */}
        <div className="location-box">
          <div className="location-box-header">
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#38bdf8" }}>
              <Navigation size={16} />
              <span>Current GPS Geolocation</span>
            </div>
            <button
              onClick={requestLocation}
              disabled={isLocating}
              className="btn-pill"
              style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <RefreshCw size={12} className={isLocating ? "spinner" : ""} />
              <span>{isLocating ? "Locating..." : "Refresh GPS"}</span>
            </button>
          </div>

          {coords ? (
            <div>
              <div className="coords-display">
                {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
              </div>
              <div className="location-meta" style={{ marginTop: "0.4rem" }}>
                <span>Accuracy: ±{coords.accuracy} meters</span>
                <span>Updated: {coords.timestamp}</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: "#38bdf8" }}
                >
                  <ExternalLink size={13} />
                  <span>Open in Google Maps</span>
                </a>
                <a
                  href={osmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", color: "#94a3b8" }}
                >
                  <ExternalLink size={13} />
                  <span>Open in OpenStreetMap</span>
                </a>
              </div>
            </div>
          ) : geoError ? (
            <div style={{ color: "#f87171", fontSize: "0.85rem" }}>
              {geoError}
            </div>
          ) : (
            <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
              <span>Requesting browser geolocation permission...</span>
            </div>
          )}
        </div>

        {/* SOS Countdown Section */}
        <div className="countdown-section">
          <div className="countdown-label">
            <Clock size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            {timerExpired ? "⚠️ SOS COUNTDOWN EXPIRED — ALARM ACTIVE" : "Safety Check-In Countdown"}
          </div>
          <div className="countdown-digits">
            {countdown < 10 ? `0${countdown}` : countdown}s
          </div>
          <div className="countdown-controls">
            <button
              className="btn-pill"
              onClick={() => resetTimer(30)}
              title="Reset 30s Check-in"
            >
              Reset 30s
            </button>
            <button
              className="btn-pill"
              onClick={() => resetTimer(60)}
              title="Set 1 Minute"
            >
              Set 1 Min
            </button>
            <button
              className="btn-pill"
              onClick={() => {
                setIsTimerRunning(!isTimerRunning);
                if (isSirenActive) stopSiren();
              }}
              style={{ background: isTimerRunning ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)" }}
            >
              {isTimerRunning ? "Pause Timer" : "Resume Timer"}
            </button>
          </div>
        </div>

        {/* Emergency Action Buttons Area */}
        <div className="emergency-grid">
          {/* Quick Call Emergency */}
          <a
            id="btn-call-emergency"
            href="tel:112"
            className="btn-emergency-call"
            title="Direct Call Emergency Dispatch"
          >
            <PhoneCall size={20} />
            <span>Call Emergency (112 / 911)</span>
          </a>

          {/* Share Live Location */}
          <button
            id="btn-share-location"
            className="btn-share-location"
            onClick={handleShareLocation}
          >
            <Share2 size={20} />
            <span>Share My Live GPS</span>
          </button>
        </div>

        {/* Secondary controls: Siren & Copy SOS text */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <button
            className={`btn-siren ${isSirenActive ? "active" : ""}`}
            onClick={toggleSiren}
            title="Audio Siren Deterrent"
          >
            {isSirenActive ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <span>{isSirenActive ? "Stop Loud Siren" : "Sound Loud Siren"}</span>
          </button>

          <button
            className="btn-siren"
            onClick={handleCopyMessage}
            title="Copy SOS Message with Coordinates"
          >
            {copied ? <Check size={18} style={{ color: "#34d399" }} /> : <Copy size={18} />}
            <span>{copied ? "SOS Copied!" : "Copy SOS Text"}</span>
          </button>
        </div>

        {/* Modal footer with safety confirmation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Tap 'I Am Safe' when out of danger
          </div>
          <button
            id="btn-i-am-safe"
            className="btn-pill"
            style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", borderColor: "rgba(16, 185, 129, 0.4)", fontWeight: 700 }}
            onClick={handleCancelSafetyMode}
          >
            I Am Safe / Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Shield, AlertOctagon, Activity } from "lucide-react";

export default function Header({ onOpenSafetyMode, isSafetyModeActive }) {
  return (
    <header className="header-wrapper">
      <div className="brand-section">
        <div className="brand-icon">
          <Shield size={22} strokeWidth={2.5} />
        </div>
        <div>
          <div className="brand-title">
            Safe<span>Pulse</span>
          </div>
          <div className="status-tag">
            <span className="pulse-dot"></span>
            AI Safety Active
          </div>
        </div>
      </div>

      <button
        id="btn-trigger-safety-mode"
        className="sos-trigger-btn"
        onClick={onOpenSafetyMode}
        aria-label="Activate Emergency Safety Mode"
      >
        <AlertOctagon size={18} strokeWidth={2.5} />
        <span>I FEEL UNSAFE</span>
      </button>
    </header>
  );
}

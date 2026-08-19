import React from "react";
import { Info, AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="disclaimer-card" role="note">
      <AlertTriangle size={18} className="disclaimer-icon" />
      <div>
        <strong>Official Advisory Disclaimer:</strong> SafePulse provides AI-assisted situational awareness and personal safety recommendations for guidance purposes only. SafePulse does <em>not</em> replace official law enforcement, medical dispatch, or emergency rescue services (such as 911 / 112). If you are in immediate physical danger, dial emergency services right away.
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Send, Sparkles, Compass, AlertCircle } from "lucide-react";

const PRESETS = [
  {
    label: "🌃 Solo travel in unfamiliar city (10:30 PM)",
    text: "I am travelling alone in an unfamiliar city at 10:30 PM, trying to reach my hotel."
  },
  {
    label: "👀 Being followed on street",
    text: "Someone has been walking behind me for two blocks, matching my speed and turns."
  },
  {
    label: "🚕 Rideshare driver taking wrong route",
    text: "My taxi/rideshare driver took an unexpected turn away from the highway into a dark area."
  },
  {
    label: "🚌 Stranded at quiet transit stop",
    text: "I missed the last scheduled train and am waiting alone at an isolated station."
  }
];

export default function SituationInput({ onSubmit, isLoading, errorMessage }) {
  const [situation, setSituation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!situation.trim() || isLoading) return;
    onSubmit(situation.trim());
  };

  const handleSelectPreset = (presetText) => {
    setSituation(presetText);
  };

  return (
    <div className="surface-card">
      <div className="input-header">
        <h2>Describe Your Current Situation</h2>
        <p>
          Type what is happening around you in natural language. SafePulse analyzes real-time risks and creates an immediate action plan.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="situation-textarea-wrapper">
          <textarea
            id="situation-input-field"
            className="situation-textarea"
            placeholder="e.g., I am walking home alone, it is dark, and I notice someone pacing behind me..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            disabled={isLoading}
            rows={4}
            maxLength={600}
            required
          />
          <div className="textarea-footer">
            <span>Be specific about time, location type, and surroundings</span>
            <span>{situation.length}/600</span>
          </div>
        </div>

        {errorMessage && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#f87171",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            background: "rgba(239, 68, 68, 0.1)",
            padding: "0.6rem 0.85rem",
            borderRadius: "8px"
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="preset-section">
          <div className="preset-title">Or choose a quick scenario:</div>
          <div className="presets-grid">
            {PRESETS.map((preset, index) => (
              <button
                key={index}
                type="button"
                className="preset-chip"
                onClick={() => handleSelectPreset(preset.text)}
                disabled={isLoading}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-analyze-situation"
          type="submit"
          className="btn-primary"
          disabled={isLoading || situation.trim().length < 3}
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Analyzing Risk via AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Assess My Safety & Generate Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

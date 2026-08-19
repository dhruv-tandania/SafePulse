import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  ListOrdered,
  Zap,
  AlertOctagon,
  ArrowRight
} from "lucide-react";

export default function RiskAssessmentCard({ assessment, onTriggerSafetyMode }) {
  if (!assessment) return null;

  const { riskLevel, riskScore, summary, riskFactors, immediateActions, safetyPlan, isFallback } = assessment;

  const getRiskIcon = () => {
    switch (riskLevel) {
      case "HIGH":
        return <ShieldAlert size={20} />;
      case "MODERATE":
        return <AlertTriangle size={20} />;
      default:
        return <ShieldCheck size={20} />;
    }
  };

  return (
    <div className="surface-card assessment-container" id="safety-assessment-result">
      {/* Risk Banner */}
      <div className={`risk-banner risk-${riskLevel}`}>
        <div className="risk-banner-top">
          <div className="risk-badge-group">
            <div className="risk-level-badge">
              {getRiskIcon()}
              <span>{riskLevel} RISK LEVEL</span>
            </div>
            {riskScore && (
              <span className="risk-score-value">
                Severity Score: {riskScore}/100
              </span>
            )}
          </div>
          {riskLevel === "HIGH" && (
            <button
              className="sos-trigger-btn"
              style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}
              onClick={onTriggerSafetyMode}
            >
              <AlertOctagon size={16} />
              <span>ACTIVATE SAFETY MODE</span>
            </button>
          )}
        </div>

        {/* Risk meter */}
        <div className="risk-meter" role="progressbar" aria-valuenow={riskScore || 50} aria-valuemin="0" aria-valuemax="100">
          <div
            className="risk-meter-fill"
            style={{ width: `${Math.min(Math.max(riskScore || 50, 15), 100)}%` }}
          ></div>
        </div>

        <p className="assessment-summary-text">{summary}</p>
      </div>

      {/* Immediate Actions (Next 60 seconds) */}
      <div className="section-block">
        <div className="section-title">
          <Zap size={18} style={{ color: "#38bdf8" }} />
          <span>Immediate Safety Recommendations (Next 60s)</span>
        </div>
        <div className="action-cards-grid">
          {immediateActions && immediateActions.map((action, index) => (
            <div key={index} className="action-card">
              <div className="action-icon-circle">
                <CheckCircle2 size={16} />
              </div>
              <div className="action-text">{action}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Identified Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
        <div className="section-block">
          <div className="section-title">
            <AlertTriangle size={18} style={{ color: "#f59e0b" }} />
            <span>Identified Risk Factors</span>
          </div>
          <div className="factors-list">
            {riskFactors.map((factor, index) => (
              <div key={index} className="factor-item">
                <span>⚠️</span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Personalized Safety Plan */}
      {safetyPlan && safetyPlan.length > 0 && (
        <div className="section-block">
          <div className="section-title">
            <ListOrdered size={18} style={{ color: "#34d399" }} />
            <span>Personalized Step-by-Step Safety Plan</span>
          </div>
          <div className="plan-steps">
            {safetyPlan.map((step, index) => (
              <div key={index} className="plan-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">{step}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Footer */}
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn-pill"
          onClick={onTriggerSafetyMode}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#f87171",
            borderColor: "rgba(239, 68, 68, 0.4)",
            padding: "0.6rem 1.1rem"
          }}
        >
          <span>Open Emergency Safety Mode & Geolocation</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

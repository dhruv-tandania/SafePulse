import React, { useState } from "react";
import Header from "./components/Header";
import SituationInput from "./components/SituationInput";
import RiskAssessmentCard from "./components/RiskAssessmentCard";
import SafetyModeModal from "./components/SafetyModeModal";
import Disclaimer from "./components/Disclaimer";
import { ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

export default function App() {
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSafetyModeOpen, setIsSafetyModeOpen] = useState(false);

  const handleAnalyzeSituation = async (situationText) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ situation: situationText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze situation");
      }

      if (result.success && result.data) {
        setAssessment(result.data);
        // Scroll smoothly to results
        setTimeout(() => {
          const resultElement = document.getElementById("safety-assessment-result");
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        throw new Error("Invalid response format received from server");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMessage(
        err.message || "Network error. Please make sure the SafePulse backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header with quick SOS trigger */}
      <Header
        onOpenSafetyMode={() => setIsSafetyModeOpen(true)}
        isSafetyModeActive={isSafetyModeOpen}
      />

      {/* Main Input Form */}
      <main style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <SituationInput
          onSubmit={handleAnalyzeSituation}
          isLoading={isLoading}
          errorMessage={errorMessage}
        />

        {/* AI Risk Assessment Results */}
        {assessment && (
          <RiskAssessmentCard
            assessment={assessment}
            onTriggerSafetyMode={() => setIsSafetyModeOpen(true)}
          />
        )}

        {/* Empty state / Introduction if no assessment done yet */}
        {!assessment && !isLoading && (
          <div className="surface-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.1)",
                color: "#38bdf8",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
              Your Instant AI Safety Co-Pilot
            </h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto", fontSize: "0.9rem" }}>
              SafePulse continuously monitors danger signals, evaluates environmental vulnerabilities, and gives you actionable steps to keep you safe in seconds.
            </p>
          </div>
        )}

        {/* Mandatory Safety Disclaimer */}
        <Disclaimer />
      </main>

      {/* High-Alert Safety Mode Modal / HUD */}
      <SafetyModeModal
        isOpen={isSafetyModeOpen}
        onClose={() => setIsSafetyModeOpen(false)}
      />
    </div>
  );
}

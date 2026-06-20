import { useState, useCallback, useRef } from "react";

export type SimulationPhase =
  | "IDLE"
  | "APPROACHING_ENTRY"
  | "OCR_SCANNING"
  | "ENTRY_GATE_OPEN"
  | "PARKED"
  | "APPROACHING_EXIT"
  | "EXIT_OCR_SCANNING"
  | "EXIT_PAYMENT"
  | "EXIT_GATE_OPEN"
  | "COMPLETED";

export interface SimulationState {
  phase: SimulationPhase;
  plateNumber: string;
  entryTime: Date | null;
  exitTime: Date | null;
  ocrResult: string | null;
  ocrProgress: number; // 0–100
  ocrConfidence: number;
  parkingFee: number;
  duration: string;
  entryGateOpen: boolean;
  exitGateOpen: boolean;
}

const PLATE = "B 8789 DI";
const HOUR_RATE_FIRST = 5000;
const HOUR_RATE_NEXT = 3000;
// Time multiplier: 1 real second = 5 simulated minutes
const TIME_MULTIPLIER = 300;

function calcFee(entryTime: Date, exitTime: Date): { fee: number; duration: string } {
  const diffMs = (exitTime.getTime() - entryTime.getTime()) * TIME_MULTIPLIER;
  const totalMinutes = Math.max(1, Math.floor(diffMs / 60000));
  const hours = Math.ceil(totalMinutes / 60);
  const displayH = Math.floor(totalMinutes / 60);
  const displayM = totalMinutes % 60;
  const duration = displayH > 0 ? `${displayH}j ${displayM}m` : `${displayM} menit`;

  let fee = 0;
  if (hours <= 1) {
    fee = HOUR_RATE_FIRST;
  } else {
    fee = HOUR_RATE_FIRST + (hours - 1) * HOUR_RATE_NEXT;
  }
  return { fee, duration };
}

export function useParkingSimulation() {
  const [state, setState] = useState<SimulationState>({
    phase: "IDLE",
    plateNumber: PLATE,
    entryTime: null,
    exitTime: null,
    ocrResult: null,
    ocrProgress: 0,
    ocrConfidence: 0,
    parkingFee: 0,
    duration: "",
    entryGateOpen: false,
    exitGateOpen: false,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Called when car enters entry trigger zone
  const triggerEntryOcr = useCallback(() => {
    setState((s) => {
      if (s.phase !== "IDLE" && s.phase !== "APPROACHING_ENTRY") return s;
      return { ...s, phase: "OCR_SCANNING", ocrResult: null, ocrProgress: 0, ocrConfidence: 0 };
    });

    // Animate OCR progress 0→100 over 2.5s
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      const confidence = Math.min(97.8, progress * 0.978);
      setState((s) =>
        s.phase === "OCR_SCANNING"
          ? { ...s, ocrProgress: Math.min(progress, 100), ocrConfidence: parseFloat(confidence.toFixed(1)) }
          : s
      );
      if (progress >= 100) {
        clearInterval(interval);
        // Show OCR result, then open gate
        setState((s) =>
          s.phase === "OCR_SCANNING"
            ? { ...s, ocrResult: PLATE, phase: "OCR_SCANNING" }
            : s
        );
        timerRef.current = setTimeout(() => {
          const now = new Date();
          setState((s) =>
            s.phase === "OCR_SCANNING"
              ? { ...s, phase: "ENTRY_GATE_OPEN", entryTime: now, entryGateOpen: true }
              : s
          );
        }, 1000);
      }
    }, 100);
  }, []);

  // Called when car has fully passed through entry gate
  const onCarPassedEntryGate = useCallback(() => {
    setState((s) => {
      if (s.phase !== "ENTRY_GATE_OPEN") return s;
      return { ...s, phase: "PARKED", entryGateOpen: false };
    });
  }, []);

  // Called when car enters exit trigger zone
  const triggerExitOcr = useCallback(() => {
    setState((s) => {
      if (s.phase !== "PARKED" && s.phase !== "APPROACHING_EXIT") return s;
      return { ...s, phase: "EXIT_OCR_SCANNING", ocrResult: null, ocrProgress: 0, ocrConfidence: 0 };
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      const confidence = Math.min(98.5, progress * 0.985);
      setState((s) =>
        s.phase === "EXIT_OCR_SCANNING"
          ? { ...s, ocrProgress: Math.min(progress, 100), ocrConfidence: parseFloat(confidence.toFixed(1)) }
          : s
      );
      if (progress >= 100) {
        clearInterval(interval);
        setState((s) => {
          if (s.phase !== "EXIT_OCR_SCANNING") return s;
          const exitTime = new Date();
          const { fee, duration } = s.entryTime
            ? calcFee(s.entryTime, exitTime)
            : { fee: HOUR_RATE_FIRST, duration: "< 1 jam" };
          return {
            ...s,
            ocrResult: PLATE,
            phase: "EXIT_OCR_SCANNING",
            exitTime,
            parkingFee: fee,
            duration,
          };
        });
        timerRef.current = setTimeout(() => {
          setState((s) =>
            s.phase === "EXIT_OCR_SCANNING"
              ? { ...s, phase: "EXIT_PAYMENT" }
              : s
          );
        }, 1000);
      }
    }, 100);
  }, []);

  // Called when user clicks "Pay & Open Gate"
  const confirmPayment = useCallback(() => {
    setState((s) => {
      if (s.phase !== "EXIT_PAYMENT") return s;
      return { ...s, phase: "EXIT_GATE_OPEN", exitGateOpen: true };
    });
  }, []);

  // Called when car has fully passed exit gate
  const onCarPassedExitGate = useCallback(() => {
    setState((s) => {
      if (s.phase !== "EXIT_GATE_OPEN") return s;
      return { ...s, phase: "COMPLETED", exitGateOpen: false };
    });
    clearTimer();
  }, []);

  // Reset everything
  const resetSimulation = useCallback(() => {
    clearTimer();
    setState({
      phase: "IDLE",
      plateNumber: PLATE,
      entryTime: null,
      exitTime: null,
      ocrResult: null,
      ocrProgress: 0,
      ocrConfidence: 0,
      parkingFee: 0,
      duration: "",
      entryGateOpen: false,
      exitGateOpen: false,
    });
  }, []);

  return {
    state,
    triggerEntryOcr,
    onCarPassedEntryGate,
    triggerExitOcr,
    confirmPayment,
    onCarPassedExitGate,
    resetSimulation,
  };
}

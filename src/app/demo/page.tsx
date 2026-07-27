"use client";

import React, { Component, ReactNode } from "react";
import dynamic from "next/dynamic";
import { useParkingSimulation } from "@/hooks/useParkingSimulation";
import { SimulationHUD } from "@/components/3d/SimulationHUD";
import { OcrOverlay } from "@/components/3d/OcrOverlay";
import { ReceiptOverlay } from "@/components/3d/ReceiptOverlay";
import { CheckInOverlay } from "@/components/3d/CheckInOverlay";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Three.js 3D Engine Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-[#020818] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl mb-4">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-red-400 mb-2">Gagal Memuat Engine 3D</h2>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            {this.state.error?.message || "Perangkat atau browser tidak mendukung WebGL secara optimal."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamic import to prevent SSR issues with Three.js
const ParkingScene = dynamic(
  () => import("@/components/3d/ParkingScene").then((m) => ({ default: m.ParkingScene })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-[#020818]">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-2 border-t-blue-500 border-blue-500/20 animate-spin mx-auto mb-4"
            style={{ borderTopColor: "#3B82F6" }}
          />
          <div className="text-blue-400 font-bold text-sm uppercase tracking-widest">
            Loading 3D Engine...
          </div>
          <div className="text-slate-500 text-xs mt-2">Initializing Three.js Scene</div>
        </div>
      </div>
    ),
  }
);

export default function DemoPage() {
  const {
    state,
    triggerEntryOcr,
    closeEntryModal,
    onCarPassedEntryGate,
    triggerExitOcr,
    confirmPayment,
    onCarPassedExitGate,
    resetSimulation,
  } = useParkingSimulation();

  return (
    <div className="relative w-full h-screen min-h-screen bg-[#020818] overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 w-full h-full">
        <ThreeErrorBoundary>
          <ParkingScene
            simState={state}
            onEntryZone={triggerEntryOcr}
            onExitedEntryGate={onCarPassedEntryGate}
            onExitZone={triggerExitOcr}
            onExitedExitGate={onCarPassedExitGate}
          />
        </ThreeErrorBoundary>
      </div>

      {/* UI Overlay Layers */}
      <SimulationHUD
        state={state}
        onReset={resetSimulation}
      />

      <OcrOverlay state={state} />

      <CheckInOverlay state={state} onClose={closeEntryModal} />

      <ReceiptOverlay state={state} onConfirmPayment={confirmPayment} />
    </div>
  );
}


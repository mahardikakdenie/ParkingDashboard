"use client";

import { useCallback, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useParkingSimulation } from "@/hooks/useParkingSimulation";
import { SimulationHUD } from "@/components/3d/SimulationHUD";
import { OcrOverlay } from "@/components/3d/OcrOverlay";
import { ReceiptOverlay } from "@/components/3d/ReceiptOverlay";

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
    onCarPassedEntryGate,
    triggerExitOcr,
    confirmPayment,
    onCarPassedExitGate,
    resetSimulation,
  } = useParkingSimulation();

  return (
    <div className="relative w-full h-full bg-[#020818]">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0">
        <ParkingScene
          simState={state}
          onEntryZone={triggerEntryOcr}
          onExitedEntryGate={onCarPassedEntryGate}
          onExitZone={triggerExitOcr}
          onExitedExitGate={onCarPassedExitGate}
        />
      </div>

      {/* UI Overlay Layers */}
      <SimulationHUD
        state={state}
        onReset={resetSimulation}
      />

      <OcrOverlay state={state} />

      <ReceiptOverlay state={state} onConfirmPayment={confirmPayment} />
    </div>
  );
}

import { useState, useCallback, useRef } from "react";
import { demoService } from "@/services/demo.service";
import { CheckInData, CheckOutData } from "@/types/api";

export type SimulationPhase =
  | "IDLE"
  | "APPROACHING_ENTRY"
  | "ENTRY_LOADING"
  | "ENTRY_MODAL"
  | "ENTRY_GATE_OPEN"
  | "PARKED"
  | "APPROACHING_EXIT"
  | "EXIT_LOADING"
  | "EXIT_PAYMENT"
  | "EXIT_GATE_OPEN"
  | "COMPLETED";

export interface SimulationState {
  phase: SimulationPhase;
  plateNumber: string;
  cardNumber: string;
  customerName: string;
  vehicleTypeId: string;
  transactionId: string | null;
  entryTime: Date | null;
  exitTime: Date | null;
  entryGateOpen: boolean;
  exitGateOpen: boolean;
  apiError: string | null;
  apiSuccessMessage: string | null;
  isApiLoading: boolean;
  checkInData: CheckInData | null;
  checkOutData: CheckOutData | null;
}

const STATIC_CARD_NUMBER = "CST-0001";
const STATIC_VEHICLE_PLATE = "Minibus";
const STATIC_VEHICLE_TYPE_ID = "609cf166-185b-4286-9fb2-f97d65490a0e";

export function useParkingSimulation() {
  const [state, setState] = useState<SimulationState>({
    phase: "IDLE",
    plateNumber: STATIC_VEHICLE_PLATE,
    cardNumber: STATIC_CARD_NUMBER,
    customerName: "Static Demo Account",
    vehicleTypeId: STATIC_VEHICLE_TYPE_ID,
    transactionId: null,
    entryTime: null,
    exitTime: null,
    entryGateOpen: false,
    exitGateOpen: false,
    apiError: null,
    apiSuccessMessage: null,
    isApiLoading: false,
    checkInData: null,
    checkOutData: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Triggered when car reaches entry gate trigger zone
  const triggerEntryOcr = useCallback(async () => {
    setState((s) => {
      if (s.phase !== "IDLE" && s.phase !== "APPROACHING_ENTRY") return s;
      return {
        ...s,
        phase: "ENTRY_LOADING",
        isApiLoading: true,
        apiError: null,
        apiSuccessMessage: null,
      };
    });

    const startTime = Date.now();
    const nowIso = new Date().toISOString();
    let resData: CheckInData = {
      id: "28e6ebb9-d852-4472-9a1b-353b87e15cf1",
      card_number: STATIC_CARD_NUMBER,
      balance: 2200000,
      vehicle_plate: STATIC_VEHICLE_PLATE,
      check_in_at: nowIso,
      status: "active",
    };

    try {
      const res = await demoService.checkIn({
        card_number: STATIC_CARD_NUMBER,
        vehicle_plate: STATIC_VEHICLE_PLATE,
        vehicle_type_id: STATIC_VEHICLE_TYPE_ID,
      });

      if (res && res.data) {
        resData = res.data;
      }
    } catch (err: any) {
      console.warn("Check-in API fallback to default mock response:", err?.message);
    }

    // Enforce 5-second minimum scanning animation time
    const elapsed = Date.now() - startTime;
    const remainingDelay = Math.max(0, 5000 - elapsed);

    setTimeout(() => {
      setState((s) => ({
        ...s,
        isApiLoading: false,
        phase: "ENTRY_MODAL",
        checkInData: resData,
        transactionId: resData.id,
        entryTime: new Date(resData.check_in_at),
      }));
    }, remainingDelay);
  }, []);

  const closeEntryModal = useCallback(() => {
    setState((s) => ({
      ...s,
      entryGateOpen: true,
      phase: "ENTRY_GATE_OPEN",
    }));

    timerRef.current = setTimeout(() => {
      setState((s) => ({ ...s, entryGateOpen: false, phase: "PARKED" }));
    }, 3000);
  }, []);

  const onCarPassedEntryGate = useCallback(() => {
    setState((s) => ({ ...s, entryGateOpen: false, phase: "PARKED" }));
  }, []);

  // Triggered when car reaches exit gate trigger zone
  const triggerExitOcr = useCallback(async () => {
    setState((s) => ({
      ...s,
      phase: "EXIT_LOADING",
      isApiLoading: true,
      apiError: null,
      apiSuccessMessage: null,
    }));

    const nowIso = new Date().toISOString();
    const entryIso = state.entryTime ? state.entryTime.toISOString() : nowIso;

    let resData: CheckOutData = {
      id: state.transactionId || "6f4b7564-613b-4b9a-993b-f00c3aa07d09",
      card_number: STATIC_CARD_NUMBER,
      balance_before: 2200000,
      balance_after: 2190000,
      check_in_at: entryIso,
      check_out_at: nowIso,
      duration_minutes: 10,
      amount: 10000,
      status: "completed",
    };

    try {
      const res = await demoService.checkOut({ card_number: STATIC_CARD_NUMBER });
      if (res && res.data) {
        resData = res.data;
      }
    } catch (err: any) {
      console.warn("Check-out API fallback to default mock response:", err?.message);
    }

    setState((s) => ({
      ...s,
      isApiLoading: false,
      phase: "EXIT_PAYMENT",
      checkOutData: resData,
      exitTime: new Date(resData.check_out_at),
    }));
  }, [state.entryTime, state.transactionId]);

  const confirmPayment = useCallback(() => {
    setState((s) => ({ ...s, exitGateOpen: true, phase: "EXIT_GATE_OPEN" }));
    timerRef.current = setTimeout(() => {
      setState((s) => ({ ...s, exitGateOpen: false, phase: "COMPLETED" }));
    }, 3000);
  }, []);

  const onCarPassedExitGate = useCallback(() => {
    setState((s) => ({ ...s, exitGateOpen: false, phase: "COMPLETED" }));
  }, []);

  const resetSimulation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState({
      phase: "IDLE",
      plateNumber: STATIC_VEHICLE_PLATE,
      cardNumber: STATIC_CARD_NUMBER,
      customerName: "Static Demo Account",
      vehicleTypeId: STATIC_VEHICLE_TYPE_ID,
      transactionId: null,
      entryTime: null,
      exitTime: null,
      entryGateOpen: false,
      exitGateOpen: false,
      apiError: null,
      apiSuccessMessage: null,
      isApiLoading: false,
      checkInData: null,
      checkOutData: null,
    });
  }, []);

  return {
    state,
    triggerEntryOcr,
    closeEntryModal,
    onCarPassedEntryGate,
    triggerExitOcr,
    confirmPayment,
    onCarPassedExitGate,
    resetSimulation,
  };
}

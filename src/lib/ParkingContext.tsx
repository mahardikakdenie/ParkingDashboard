"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ParkingSession {
  id: string;
  plateNumber: string;
  vehicleType: "CAR" | "MOTORCYCLE";
  entryTime: string;
  exitTime?: string;
  method: "EMONEY" | "TICKET";
  identifier: string; // E-money Card ID or Ticket QR String
  status: "ACTIVE" | "COMPLETED";
  fee?: number;
}

interface ParkingContextType {
  sessions: ParkingSession[];
  addSession: (session: Omit<ParkingSession, "id" | "status" | "entryTime">) => ParkingSession;
  completeSession: (id: string, fee: number) => void;
  findActiveSession: (identifier: string, plateNumber?: string) => ParkingSession | undefined;
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);

  // Seed initial data if empty for demo purposes
  useEffect(() => {
    const saved = localStorage.getItem("parking_sessions");
    if (saved) {
      setSessions(JSON.parse(saved));
    } else {
      const initial: ParkingSession[] = [
        {
          id: "1",
          plateNumber: "B 1234 ABC",
          vehicleType: "CAR",
          entryTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), // 3.5 hours ago
          method: "TICKET",
          identifier: "TKT-1718876400000",
          status: "ACTIVE",
        },
        {
          id: "2",
          plateNumber: "D 9999 XYZ",
          vehicleType: "MOTORCYCLE",
          entryTime: new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString(), // 1.2 hours ago
          method: "EMONEY",
          identifier: "EMN-987654321",
          status: "ACTIVE",
        },
      ];
      setSessions(initial);
      localStorage.setItem("parking_sessions", JSON.stringify(initial));
    }
  }, []);

  const addSession = (sessionData: Omit<ParkingSession, "id" | "status" | "entryTime">) => {
    const newSession: ParkingSession = {
      ...sessionData,
      id: Math.random().toString(36).substr(2, 9),
      entryTime: new Date().toISOString(),
      status: "ACTIVE",
    };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("parking_sessions", JSON.stringify(updated));
    return newSession;
  };

  const completeSession = (id: string, fee: number) => {
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: "COMPLETED" as const,
          exitTime: new Date().toISOString(),
          fee,
        };
      }
      return s;
    });
    setSessions(updated);
    localStorage.setItem("parking_sessions", JSON.stringify(updated));
  };

  const findActiveSession = (identifier: string, plateNumber?: string) => {
    return sessions.find(
      (s) =>
        s.status === "ACTIVE" &&
        (s.identifier.toLowerCase() === identifier.toLowerCase() ||
          (plateNumber && s.plateNumber.replace(/\s+/g, "").toLowerCase() === plateNumber.replace(/\s+/g, "").toLowerCase()))
    );
  };

  return (
    <ParkingContext.Provider value={{ sessions, addSession, completeSession, findActiveSession }}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error("useParking must be used within a ParkingProvider");
  }
  return context;
}

"use client";

import React, { useState } from "react";
import { useParking } from "@/lib/ParkingContext";
import { CameraStream } from "@/components/CameraStream";
import { Cpu, CreditCard, Ticket, Printer, CheckCircle, Car, Eye, RefreshCw, Smartphone } from "lucide-react";

export default function GateInPage() {
  const { addSession } = useParking();

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<"CAR" | "MOTORCYCLE">("CAR");
  
  // Selection state
  const [method, setMethod] = useState<"EMONEY" | "TICKET">("TICKET");
  const [cardId, setCardId] = useState("");
  
  // Simulation results
  const [activeSession, setActiveSession] = useState<any>(null);
  const [gateOpen, setGateOpen] = useState(false);
  
  // Mock image for OCR
  const mockCarImages = [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80", // Porsche
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80", // Jeep
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80"  // Chevy
  ];
  
  const [currentCamIndex, setCurrentCamIndex] = useState(0);

  const simulateOcr = async () => {
    setOcrLoading(true);
    // Real call to the proxy prediction route, but using a file fetch
    try {
      const response = await fetch(mockCarImages[currentCamIndex]);
      const blob = await response.blob();
      const file = new File([blob], "camera_snapshot.jpg", { type: "image/jpeg" });
      
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/ocr/predict", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setPlateNumber(result.data.plate_number);
          setVehicleType(result.data.vehicle_type === "motorcycle" ? "MOTORCYCLE" : "CAR");
        } else {
          // Fallback to random plates if API fails or format is invalid
          const randomPlates = ["B 1042 SKF", "D 8472 UYT", "F 4392 LKA"];
          setPlateNumber(randomPlates[Math.floor(Math.random() * randomPlates.length)]);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      // Fallback
      const randomPlates = ["B 1042 SKF", "D 8472 UYT", "F 4392 LKA"];
      setPlateNumber(randomPlates[Math.floor(Math.random() * randomPlates.length)]);
    } finally {
      setOcrLoading(false);
      // Toggle image index for next time
      setCurrentCamIndex((prev) => (prev + 1) % mockCarImages.length);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;

    let identifier = "";
    if (method === "EMONEY") {
      identifier = cardId || `EMN-${Math.floor(100000000 + Math.random() * 900000000)}`;
    } else {
      identifier = `TKT-${Date.now()}`;
    }

    const session = addSession({
      plateNumber: plateNumber.toUpperCase(),
      vehicleType,
      method,
      identifier,
    });

    setActiveSession(session);
    setGateOpen(true);

    // Auto close gate after 4 seconds
    setTimeout(() => {
      setGateOpen(false);
    }, 4500);
  };

  const handleReset = () => {
    setPlateNumber("");
    setCardId("");
    setActiveSession(null);
    setGateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-bold text-white tracking-tight uppercase">Gate In (Simulasi Masuk)</h1>
        <p className="text-[10px] text-slate-500 mt-0.5">Simulasikan proses tapping E-Money atau pencetakan tiket dengan OCR kamera plat nomor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Camera Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <CameraStream
            id="CAM-IN-01"
            name="Gate In Camera"
            location="Main Entrance Gate"
            status="recording"
            imageUrl={mockCarImages[currentCamIndex]}
          />

          <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Kamera OCR Controller</h3>
            <button
              onClick={simulateOcr}
              disabled={ocrLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 border border-blue-500 transition-all disabled:bg-slate-800 disabled:border-slate-700 disabled:text-slate-500"
            >
              {ocrLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Membaca Plat...
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  Capture & Deteksi Plat Nomor
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Inputs and Operations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Gate status indicator */}
          <div className={`p-4 rounded-lg border flex items-center justify-between transition-all ${
            gateOpen 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-slate-800/40 border-slate-700 text-slate-400"
          }`}>
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full ${gateOpen ? "bg-emerald-500 animate-ping" : "bg-slate-650"}`} />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider">PALANG PINTU MASUK</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Status Palang saat ini</p>
              </div>
            </div>
            <span className="text-sm font-black tracking-widest uppercase font-mono">
              {gateOpen ? "OPEN (TERBUKA)" : "CLOSED (TERTUTUP)"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operator Form */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Pintu Masuk Registrasi</h2>
              
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Plate number */}
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Nomor Plat Kendaraan</label>
                  <input
                    type="text"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="B 1234 ABC"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono tracking-wider"
                    required
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Jenis Kendaraan</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVehicleType("CAR")}
                      className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                        vehicleType === "CAR"
                          ? "bg-blue-600/20 border-blue-500 text-blue-400"
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      <Car className="w-3.5 h-3.5 inline mr-1.5" /> Mobil
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehicleType("MOTORCYCLE")}
                      className={`py-1.5 text-xs font-bold rounded border transition-colors ${
                        vehicleType === "MOTORCYCLE"
                          ? "bg-blue-600/20 border-blue-500 text-blue-400"
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      Motor
                    </button>
                  </div>
                </div>

                {/* Method */}
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Metode Masuk</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod("TICKET")}
                      className={`py-1.5 text-xs font-bold rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        method === "TICKET"
                          ? "bg-blue-600/20 border-blue-500 text-blue-400"
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      <Ticket className="w-3.5 h-3.5" /> Tiket QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("EMONEY")}
                      className={`py-1.5 text-xs font-bold rounded border transition-colors flex items-center justify-center gap-1.5 ${
                        method === "EMONEY"
                          ? "bg-blue-600/20 border-blue-500 text-blue-400"
                          : "bg-slate-900 border-slate-700 text-slate-400"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> E-Money
                    </button>
                  </div>
                </div>

                {/* E-Money simulation input */}
                {method === "EMONEY" && (
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Simulasi Tap Kartu E-Money</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cardId}
                        onChange={(e) => setCardId(e.target.value)}
                        placeholder="Masukkan ID Kartu (cth: 10293)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setCardId(`EMN-${Math.floor(100000000 + Math.random() * 900000000)}`)}
                        className="px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] uppercase font-bold text-slate-350"
                      >
                        Acak ID
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!plateNumber}
                  className={`w-full py-2.5 mt-2 rounded font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border transition-all ${
                    !plateNumber
                      ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white cursor-pointer"
                  }`}
                >
                  {method === "TICKET" ? (
                    <>
                      <Printer className="w-4 h-4" /> Cetak Tiket & Masuk
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Tap E-Money & Masuk
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Simulated Hardware Result Preview */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-5 flex flex-col justify-between min-h-75">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Simulasi Output Hardware</h2>
                
                {activeSession ? (
                  <div className="space-y-4">
                    {/* Visual Success */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-3 rounded flex items-start gap-2.5 text-xs font-semibold">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                      <div>
                        <span>Registrasi Berhasil!</span>
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Palang terbuka, silakan masuk.</span>
                      </div>
                    </div>

                    {activeSession.method === "TICKET" ? (
                      /* Ticket print rendering */
                      <div className="bg-white text-slate-900 border border-slate-300 rounded p-4 font-mono text-[10px] shadow-lg max-w-55 mx-auto text-center flex flex-col items-center">
                        <div className="font-bold border-b border-dashed border-slate-900 pb-1.5 w-full uppercase tracking-wider text-xs">
                          TICKET NexGate
                        </div>
                        <div className="py-3 flex flex-col items-center w-full">
                          {/* Simulated QR Code using style */}
                          <div className="w-24 h-24 bg-slate-900 flex items-center justify-center text-white mb-2 p-1.5">
                            {/* QR blocks mockup */}
                            <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                              {[...Array(16)].map((_, i) => (
                                <div key={i} className={`w-full h-full ${i % 3 === 0 || i % 5 === 1 ? "bg-slate-950" : "bg-white"}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold mt-1 text-slate-800">{activeSession.identifier}</span>
                        </div>
                        <div className="text-left w-full space-y-1 text-[9px] pt-1.5 border-t border-dashed border-slate-900">
                          <div>PLAT: <span className="font-bold">{activeSession.plateNumber}</span></div>
                          <div>TIPE: <span className="font-bold">{activeSession.vehicleType}</span></div>
                          <div>MASUK: {new Date(activeSession.entryTime).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ) : (
                      /* E-money Reader Screen rendering */
                      <div className="bg-slate-900/60 border border-blue-500/20 rounded p-4 font-mono text-center max-w-55 mx-auto text-blue-400 shadow-lg">
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">Reader E-Money</div>
                        <CreditCard className="w-10 h-10 mx-auto my-3 text-blue-500" />
                        <div className="text-xs font-bold">{activeSession.identifier}</div>
                        <div className="text-[10px] text-slate-300 mt-2">DITERIMA</div>
                        <div className="text-[9px] text-slate-500 mt-1">Saldo Terbaca: Rp 50.000</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                    <Smartphone className="w-8 h-8 opacity-45 mb-2" />
                    <p className="text-xs font-semibold">Menunggu Pendaftaran</p>
                    <p className="text-[9px] mt-0.5">Isi form & daftarkan masuk untuk melihat output printer tiket / reader E-Money.</p>
                  </div>
                )}
              </div>

              {activeSession && (
                <button
                  onClick={handleReset}
                  className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px] uppercase font-bold tracking-wider"
                >
                  Ulangi Simulasi Baru
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

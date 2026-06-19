"use client";

import React, { useState } from "react";
import { useParking, ParkingSession } from "@/lib/ParkingContext";
import { CameraStream } from "@/components/CameraStream";
import { Cpu, CreditCard, Ticket, CheckCircle, Car, RefreshCw, AlertTriangle, Clock, Receipt, QrCode } from "lucide-react";

export default function GateOutPage() {
  const { sessions, completeSession, findActiveSession } = useParking();

  // OCR/Search state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(""); // Can be plate number or ticket/emoney ID
  
  // Found session details
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Pricing/Duration calculations
  const [durationText, setDurationText] = useState("");
  const [calculatedFee, setCalculatedFee] = useState(0);

  // Exit Simulation state
  const [paymentStep, setPaymentStep] = useState<"LOOKUP" | "PAYMENT" | "SUCCESS">("LOOKUP");
  const [gateOpen, setGateOpen] = useState(false);
  const [showQrisCode, setShowQrisCode] = useState(false);

  // Unsplash images representing parking exits
  const mockExitImages = [
    "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80", // Volvo in parking exit
    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80", // Garage exit
  ];
  
  const [currentCamIndex, setCurrentCamIndex] = useState(0);

  // Rate constants
  const RATES = {
    CAR: { firstHour: 5000, nextHour: 3000 },
    MOTORCYCLE: { firstHour: 2000, nextHour: 1500 },
  };

  const simulateOcr = async () => {
    setOcrLoading(true);
    setErrorMsg("");
    try {
      // Find an active session to simulate a real exit detection
      const activeSessions = sessions.filter((s) => s.status === "ACTIVE");
      if (activeSessions.length > 0) {
        // Pick one to simulate detection
        const randomSession = activeSessions[Math.floor(Math.random() * activeSessions.length)];
        setSearchValue(randomSession.plateNumber);
        handleLookup(randomSession.plateNumber);
      } else {
        // No active sessions in memory, mock a random plate
        setSearchValue("B 9999 NOTFOUND");
        setErrorMsg("Plat nomor terdeteksi B 9999 NOTFOUND, namun sesi tidak ditemukan di database!");
        setActiveSession(null);
      }
    } catch (e) {
      setErrorMsg("Gagal melakukan capture OCR.");
    } finally {
      setOcrLoading(false);
      setCurrentCamIndex((prev) => (prev + 1) % mockExitImages.length);
    }
  };

  const calculateParking = (session: ParkingSession) => {
    const entry = new Date(session.entryTime);
    const exit = new Date();
    const diffMs = exit.getTime() - entry.getTime();
    
    // Calculate total hours (rounded up)
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    setDurationText(`${hours} Jam ${minutes} Menit`);
    
    // Calculate fee based on rates
    const vehicleRate = RATES[session.vehicleType];
    let totalFee = vehicleRate.firstHour;
    if (diffHours > 1) {
      totalFee += (diffHours - 1) * vehicleRate.nextHour;
    }
    
    setCalculatedFee(totalFee);
  };

  const handleLookup = (value = searchValue) => {
    setErrorMsg("");
    if (!value.trim()) return;

    // Search by plate or ticket identifier
    const found = findActiveSession(value, value);
    
    if (found) {
      setActiveSession(found);
      calculateParking(found);
      setPaymentStep("PAYMENT");
    } else {
      setActiveSession(null);
      setErrorMsg("Kendaraan tidak ditemukan atau sudah checkout.");
    }
  };

  const handlePayment = () => {
    if (!activeSession) return;
    
    completeSession(activeSession.id, calculatedFee);
    setPaymentStep("SUCCESS");
    setGateOpen(true);
    setShowQrisCode(false);

    // Auto close gate after 4 seconds
    setTimeout(() => {
      setGateOpen(false);
    }, 4500);
  };

  const handleReset = () => {
    setSearchValue("");
    setActiveSession(null);
    setErrorMsg("");
    setPaymentStep("LOOKUP");
    setGateOpen(false);
    setShowQrisCode(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-bold text-white tracking-tight uppercase">Gate Out (Simulasi Keluar)</h1>
        <p className="text-[10px] text-slate-500 mt-0.5">Verifikasi plat nomor kendaraan, hitung tarif parkir, dan selesaikan pembayaran.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Camera Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <CameraStream
            id="CAM-OUT-01"
            name="Gate Out Camera"
            location="Exit Gate Barrier 1"
            status="recording"
            imageUrl={mockExitImages[currentCamIndex]}
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
                  Mencocokkan Plat...
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  Capture & Verifikasi Plat Nomor
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Exit Logic (7 cols) */}
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
                <span className="text-xs font-bold uppercase tracking-wider">PALANG PINTU KELUAR</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Status Palang saat ini</p>
              </div>
            </div>
            <span className="text-sm font-black tracking-widest uppercase font-mono">
              {gateOpen ? "OPEN (TERBUKA)" : "CLOSED (TERTUTUP)"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operator Terminal */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-5">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Kasir Pintu Keluar</h2>
              
              {paymentStep === "LOOKUP" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase text-slate-400 font-bold mb-1.5">Input Tiket / Plat Nomor / E-Money</label>
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Cari Plat (cth: B 1234 ABC) atau ID Tiket"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono tracking-wider"
                    />
                  </div>

                  <button
                    onClick={() => handleLookup()}
                    disabled={!searchValue}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold uppercase tracking-wider text-[11px]"
                  >
                    Check Tiket & Durasi
                  </button>

                  {errorMsg && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded flex items-start gap-2.5 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="bg-slate-900/50 rounded-lg p-3.5 border border-slate-800 text-[10px] text-slate-400">
                    <p className="font-semibold text-white uppercase tracking-wider mb-1.5">Daftar Aktif (Simulasi):</p>
                    {sessions.filter(s => s.status === "ACTIVE").length === 0 ? (
                      <p className="italic text-slate-500">Tidak ada kendaraan aktif saat ini.</p>
                    ) : (
                      <div className="max-h-[100px] overflow-y-auto space-y-1 pr-1">
                        {sessions.filter(s => s.status === "ACTIVE").map((s) => (
                          <div 
                            key={s.id} 
                            onClick={() => {
                              setSearchValue(s.plateNumber);
                              handleLookup(s.plateNumber);
                            }}
                            className="flex justify-between hover:bg-slate-800 p-1.5 rounded cursor-pointer transition-colors border border-transparent hover:border-slate-700 font-mono"
                          >
                            <span className="text-white font-bold">{s.plateNumber}</span>
                            <span className="text-slate-500">[{s.method}]</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentStep === "PAYMENT" && activeSession && (
                <div className="space-y-4">
                  {/* Bill Details */}
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 space-y-3 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-dashed border-slate-700 pb-2">
                      <span className="text-slate-500">PLAT NOMOR:</span>
                      <span className="text-white font-bold text-sm">{activeSession.plateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">METODE:</span>
                      <span className="text-white font-semibold">{activeSession.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">DURASI:</span>
                      <span className="text-white flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400" /> {durationText}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-750 pt-2 text-xs">
                      <span className="text-indigo-400 font-bold uppercase">TOTAL TARIF:</span>
                      <span className="text-white font-black text-sm">Rp {calculatedFee.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  {/* Payment Methods simulation */}
                  {activeSession.method === "EMONEY" ? (
                    <div className="space-y-3">
                      <div className="bg-blue-500/10 border border-blue-500/25 p-3 rounded text-[10px] text-blue-350">
                        <CreditCard className="w-4 h-4 inline mr-2 text-blue-450" />
                        Tapping E-Money untuk pembayaran otomatis.
                      </div>
                      <button
                        onClick={handlePayment}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-wider text-[11px]"
                      >
                        Simulasikan Tap E-Money
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!showQrisCode ? (
                        <button
                          onClick={() => setShowQrisCode(true)}
                          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" /> Tampilkan QR Pembayaran
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg max-w-[150px] mx-auto border border-slate-350 flex flex-col items-center">
                            <QrCode className="w-32 h-32 text-slate-900" />
                            <div className="text-[8px] text-slate-500 font-sans mt-1.5 font-bold tracking-widest uppercase">QRIS STANDARDIZED</div>
                          </div>
                          <button
                            onClick={handlePayment}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold uppercase tracking-wider text-[10px]"
                          >
                            Simulasikan Bayar (QRIS Sukses)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleReset}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[9px] uppercase font-bold"
                  >
                    Batal / Cari Ulang
                  </button>
                </div>
              )}

              {paymentStep === "SUCCESS" && (
                <div className="text-center py-6 space-y-4">
                  <div className="inline-flex p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-450">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">Checkout Sukses</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Pembayaran terverifikasi. Palang pintu keluar terbuka.</p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] uppercase font-bold tracking-wider"
                  >
                    Selesai & Reset
                  </button>
                </div>
              )}
            </div>

            {/* Receipt / Invoice Preview simulation */}
            <div className="bg-[#1E293B] border border-slate-700 rounded-lg p-5 flex flex-col justify-between min-h-[300px]">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Simulasi Struk Parkir</h2>
                
                {activeSession && paymentStep === "SUCCESS" ? (
                  <div className="bg-white text-slate-900 border border-slate-300 rounded p-4 font-mono text-[9px] shadow-lg max-w-[220px] mx-auto text-left space-y-2">
                    <div className="text-center font-bold border-b border-dashed border-slate-900 pb-1.5 w-full uppercase tracking-wider text-xs">
                      INVOICE PARKFLOW.AI
                    </div>
                    <div className="space-y-1 pt-1.5">
                      <div>PLAT: <span className="font-bold">{activeSession.plateNumber}</span></div>
                      <div>TIPE: <span className="font-bold">{activeSession.vehicleType}</span></div>
                      <div>IDENTIFIER: <span className="font-bold text-[8px]">{activeSession.identifier}</span></div>
                      <div className="border-t border-slate-200 my-1 pt-1">
                        <div>MASUK: {new Date(activeSession.entryTime).toLocaleString("id-ID")}</div>
                        <div>KELUAR: {new Date().toLocaleString("id-ID")}</div>
                        <div>DURASI: {durationText}</div>
                      </div>
                      <div className="border-t border-dashed border-slate-900 my-1 pt-1.5 flex justify-between font-bold text-xs">
                        <span>TOTAL BAYAR:</span>
                        <span>Rp {calculatedFee.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <div className="text-center text-[7px] text-slate-500 pt-2 uppercase">TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12 text-center">
                    <Receipt className="w-8 h-8 opacity-45 mb-2" />
                    <p className="text-xs font-semibold">Struk Belum Dibuat</p>
                    <p className="text-[9px] mt-0.5">Struk digital akan dicetak secara otomatis setelah pembayaran sukses diverifikasi.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

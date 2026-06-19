"use client";

import { useState } from "react";
import { Upload, FileImage, Cpu, CheckCircle2, AlertCircle, RefreshCw, Car, ShieldCheck, Clock, Activity, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";

interface OcrResponse {
  success: boolean;
  message: string;
  data?: {
    plate_number: string;
    vehicle_type: string;
    confidence: number;
    ocr_conf: number;
    detection_conf: number;
    is_valid: boolean;
    filename: string;
    sample_used: string;
    metadata: {
      metrics: {
        detection_ms: number;
        preprocess_ms: number;
        ocr_ms: number;
        normalize_ms: number;
        total_ms: number;
      };
    };
  };
}

export default function OcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select or drop an image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/ocr/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = `API error: ${response.status} ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data: OcrResponse = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-bold text-white tracking-tight uppercase">OCR Plate Recognition</h1>
        <p className="text-[10px] text-slate-500 mt-0.5">Integrate AI-driven OCR to scan and read vehicle license plates from parking images.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <div className="bg-[#1E293B] rounded-lg border border-slate-700 p-6 flex flex-col justify-between min-h-[400px]">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Upload Parking Photo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  previewUrl 
                    ? "border-blue-500 bg-blue-500/5" 
                    : "border-slate-600 hover:border-slate-500 bg-slate-900/40"
                }`}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full aspect-video rounded overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-xs font-semibold text-slate-350">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG, JPEG (e.g. Gambar parkir.jpg)</p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded border border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileImage className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-[11px] text-slate-300 truncate font-mono">{selectedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[9px] text-rose-450 hover:text-rose-400 font-bold uppercase tracking-wider transition-colors ml-4"
                  >
                    Clear
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || loading}
                className={`w-full py-2.5 rounded font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 border transition-all ${
                  loading
                    ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                    : selectedFile
                    ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white cursor-pointer"
                    : "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Cpu className="w-3.5 h-3.5" />
                    Run OCR Recognition
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-[#1E293B] rounded-lg border border-slate-700 p-6 flex flex-col min-h-[400px]">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Recognition Analysis</h2>

          <div className="flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="text-center py-12 space-y-3">
                <div className="inline-flex p-3 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400 animate-pulse">
                  <Cpu className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-xs text-slate-350 font-medium">Extracting Plate Details...</p>
                <p className="text-[10px] text-slate-500">Contacting OCR API and predicting license plate characters</p>
              </div>
            ) : result && result.data ? (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-[12px] uppercase tracking-wider">Analysis Complete</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">Vehicle plate detected with high confidence.</div>
                  </div>
                </div>

                {/* Plate Number */}
                <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Detected Plate Number</span>
                  <div className="bg-white border-4 border-slate-300 rounded-lg py-3 px-8 shadow-inner shadow-slate-400/50 transform transition-transform group-hover:scale-105">
                    <span className="text-4xl md:text-5xl font-black font-mono tracking-widest text-slate-900 uppercase">
                      {result.data.plate_number || "UNKNOWN"}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-md">
                      <Car className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Vehicle Type</div>
                      <div className="text-sm font-semibold text-white capitalize">{result.data.vehicle_type?.replace('_', ' ') || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
                    <div className={`p-2 rounded-md ${result.data.is_valid ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                      <ShieldCheck className={`w-4 h-4 ${result.data.is_valid ? 'text-emerald-400' : 'text-rose-400'}`} />
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Validity</div>
                      <div className="text-sm font-semibold text-white">
                        {result.data.is_valid ? 'Valid Format' : 'Invalid Format'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Scores */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Confidence Scores</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">Overall</span>
                        <span className="text-white font-bold">{(result.data.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${result.data.confidence * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">OCR Reading</span>
                        <span className="text-white font-bold">{(result.data.ocr_conf * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${result.data.ocr_conf * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-400">Detection</span>
                        <span className="text-white font-bold">{(result.data.detection_conf * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${result.data.detection_conf * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Processing Time Grid */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Processing Time</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <div className="text-[9px] text-slate-500 mb-0.5">Detection</div>
                      <div className="text-xs text-slate-300 font-mono">{result.data.metadata?.metrics?.detection_ms?.toFixed(1) || 0}ms</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <div className="text-[9px] text-slate-500 mb-0.5">OCR Read</div>
                      <div className="text-xs text-slate-300 font-mono">{result.data.metadata?.metrics?.ocr_ms?.toFixed(1) || 0}ms</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 text-center">
                      <div className="text-[9px] text-slate-500 mb-0.5">Preprocess</div>
                      <div className="text-xs text-slate-300 font-mono">{result.data.metadata?.metrics?.preprocess_ms?.toFixed(2) || 0}ms</div>
                    </div>
                    <div className="bg-slate-900/50 rounded p-2 text-center border border-amber-500/20">
                      <div className="text-[9px] text-amber-500/80 mb-0.5">Total</div>
                      <div className="text-xs text-amber-400 font-bold font-mono">{result.data.metadata?.metrics?.total_ms?.toFixed(1) || 0}ms</div>
                    </div>
                  </div>
                </div>

                {/* File Details */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-900/30 p-2.5 rounded border border-slate-800/50">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{result.data.filename}</span>
                  </div>
                  <span>{result.data.sample_used}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileImage className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-xs">No analysis running</p>
                <p className="text-[10px] mt-1">Upload an image and run OCR to see predicted results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

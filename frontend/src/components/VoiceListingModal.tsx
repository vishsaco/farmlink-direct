"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { parseVoiceInput, ParsedVoiceLot } from "@/lib/voiceParser";
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  AlertCircle,
  Volume2,
  Languages,
} from "lucide-react";

interface VoiceListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedVoiceLot) => void;
  lang?: "en" | "hi";
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceListingModal({
  isOpen,
  onClose,
  onApply,
  lang: initialLang = "hi",
}: VoiceListingModalProps) {
  const [selectedLang, setSelectedLang] = useState<"hi" | "en">(initialLang);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState<ParsedVoiceLot | null>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>(new Array(16).fill(10));
  const [micError, setMicError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const shouldKeepRecordingRef = useRef<boolean>(false);

  const sampleVoicePrompts = [
    {
      label: "🍅 500 किलो टमाटर ग्रेड ए भाव 38 रुपये",
      text: "500 किलो टमाटर ग्रेड ए कल सुबह पिकअप भाव 38 रुपया",
    },
    {
      label: "🧅 800 kg Grade A Onion ₹30/kg",
      text: "800 kg Grade A onion ready tomorrow price 30 rupees per kg",
    },
    {
      label: "🥔 1000 किलो आलू उत्तम क्वालिटी 24 रुपये",
      text: "1000 किलो आलू ग्रेड ए बढ़िया माल भाव 24 रुपये प्रति किलो",
    },
  ];

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        setIsSupported(false);
      }
    }
  }, []);

  // Cleanup on unmount or close
  const stopAllAudio = useCallback(() => {
    shouldKeepRecordingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setIsRecording(false);
    setAudioLevel(new Array(16).fill(10));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopAllAudio();
      setTranscript("");
      setParsedData(null);
      setMicError(null);
    }
  }, [isOpen, stopAllAudio]);

  // Visualizer loop
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualizer = () => {
        if (!shouldKeepRecordingRef.current) return;

        analyser.getByteFrequencyData(dataArray);

        const bars: number[] = [];
        const step = Math.floor(bufferLength / 16);
        for (let i = 0; i < 16; i++) {
          const val = dataArray[i * step] || 0;
          const heightPct = Math.max(15, Math.min(100, (val / 255) * 100));
          bars.push(heightPct);
        }
        setAudioLevel(bars);

        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      updateVisualizer();
    } catch (err) {
      console.warn("Visualizer init error", err);
    }
  };

  const startListening = async () => {
    setMicError(null);
    shouldKeepRecordingRef.current = true;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      startVisualizer(stream);
    } catch (err: any) {
      console.error("Microphone permission denied:", err);
      setMicError(
        "Microphone access blocked. Please allow microphone permissions in your browser address bar to speak."
      );
      shouldKeepRecordingRef.current = false;
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang === "hi" ? "hi-IN" : "en-IN";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + " ";
        }
        const clean = fullTranscript.trim();
        setTranscript(clean);

        if (clean) {
          const parsed = parseVoiceInput(clean);
          setParsedData(parsed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicError("Microphone or speech service not allowed. Try using Google Chrome or Microsoft Edge.");
        }
      };

      recognition.onend = () => {
        if (shouldKeepRecordingRef.current) {
          try {
            recognition.start();
          } catch {}
        } else {
          setIsRecording(false);
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Could not start recognition directly", err);
      }
    } else {
      setIsRecording(true);
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      stopAllAudio();
    } else {
      startListening();
    }
  };

  const handleSimulateVoice = (sampleText: string) => {
    stopAllAudio();
    setTranscript("");
    setParsedData(null);
    setIsRecording(true);

    let idx = 0;
    const words = sampleText.split(" ");
    const interval = setInterval(() => {
      if (idx < words.length) {
        const partial = words.slice(0, idx + 1).join(" ");
        setTranscript(partial);
        setParsedData(parseVoiceInput(partial));
        idx++;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-calm-reveal">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 text-slate-800">
        {/* Close Button */}
        <button
          onClick={() => {
            stopAllAudio();
            onClose();
          }}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header & Language Toggle */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                {selectedLang === "hi" ? "आवाज से उपज लिस्ट करें" : "Voice-Assisted Produce Listing"}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {selectedLang === "hi"
                  ? "बोलें — फसल, मात्रा, ग्रेड और भाव स्वतः भर जाएंगे"
                  : "Speak naturally in Hindi or English to auto-populate your produce lot"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedLang(selectedLang === "hi" ? "en" : "hi")}
            className="flex items-center gap-1 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold border border-slate-200 hover:bg-slate-100 transition"
          >
            <Languages className="h-3.5 w-3.5 text-emerald-600" />
            <span>{selectedLang === "hi" ? "हिन्दी" : "English"}</span>
          </button>
        </div>

        {micError && (
          <div className="rounded-lg bg-rose-50 p-3 border border-rose-200 text-xs font-medium text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* Real-time Voice Visualizer & Tactile Mic Button */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3.5">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
            )}
            <button
              onClick={handleToggleRecord}
              className={`relative z-10 flex h-18 w-18 items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
                isRecording
                  ? "bg-rose-600 text-white scale-105 ring-4 ring-rose-200"
                  : "bg-emerald-600 text-white hover:scale-105 hover:bg-emerald-700 active:scale-95"
              }`}
            >
              {isRecording ? (
                <MicOff className="h-7 w-7 animate-pulse" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
          </div>

          {/* Live Audio Frequency Waveform Bars */}
          {isRecording ? (
            <div className="flex items-end justify-center gap-1 h-8 w-full px-8">
              {audioLevel.map((heightPct, idx) => (
                <div
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className="w-1.5 rounded-full bg-emerald-600 transition-all duration-75"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-slate-800">
              {selectedLang === "hi"
                ? "बोलने के लिए माइक दबाएं (Tap to Speak)"
                : "Tap microphone to begin speaking"}
            </p>
          )}

          {/* Live Transcript Box */}
          <div className="w-full min-h-[52px] rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-800">
            {transcript ? (
              <p className="italic font-medium">{transcript}</p>
            ) : (
              <span className="text-slate-400 italic font-normal">
                {selectedLang === "hi"
                  ? "उदा. '500 किलो टमाटर ग्रेड ए भाव 38 रुपये'..."
                  : "e.g. '500 kg Grade A tomatoes asking price 38 rupees'..."}
              </span>
            )}
          </div>
        </div>

        {/* Quick Sample Voice Buttons */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Try Sample Voice Prompts (One-Tap Test)</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleVoicePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateVoice(sample.text)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-500 hover:bg-white transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extracted Fields Preview */}
        {parsedData && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Extracted Produce Details</span>
              </span>
              <span className="rounded-md bg-emerald-600 px-2 py-0.2 text-[10px] font-bold text-white">
                {parsedData.commodity ? "100% Parsed" : "Listening..."}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Commodity</span>
                <p className="font-bold text-slate-900 capitalize">
                  {parsedData.commodity || "Not detected"}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Grade</span>
                <p className="font-bold text-slate-900">
                  {parsedData.grade ? `Grade ${parsedData.grade}` : "Not detected"}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Quantity</span>
                <p className="font-bold text-emerald-700">
                  {parsedData.available_qty ? `${parsedData.available_qty} kg` : "Not detected"}
                </p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold">Rate</span>
                <p className="font-bold text-emerald-700">
                  {parsedData.asking_price ? `₹${parsedData.asking_price}/kg` : "Not detected"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            disabled={!parsedData || !parsedData.commodity}
            onClick={() => {
              if (parsedData) {
                stopAllAudio();
                onApply(parsedData);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <span>Apply to Listing Form</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

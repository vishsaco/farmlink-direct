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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#262238]/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[28px] border border-[#E4E2DD] bg-white p-6 sm:p-8 shadow-2xl space-y-5 text-[#262238]">
        {/* Close Button */}
        <button
          onClick={() => {
            stopAllAudio();
            onClose();
          }}
          className="absolute right-5 top-5 rounded-full p-2 text-[#737184] hover:bg-[#F6F5F1] hover:text-[#262238] transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header & Language Toggle */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E4E2DD] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#E8E4F2] text-[#262238] shadow-xs">
              <Mic className="h-5 w-5 text-[#718A68]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-normal tracking-tight text-[#262238]">
                {selectedLang === "hi" ? "आवाज से उपज लिस्ट करें" : "Voice-Assisted Produce Listing"}
              </h3>
              <p className="text-xs text-[#737184] font-normal">
                {selectedLang === "hi"
                  ? "बोलें — फसल, मात्रा, ग्रेड और भाव स्वतः भर जाएंगे"
                  : "Speak naturally in Hindi or English to auto-populate your produce lot"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedLang(selectedLang === "hi" ? "en" : "hi")}
            className="flex items-center gap-1.5 rounded-full bg-[#F6F5F1] px-3 py-1 text-xs font-medium border border-[#E4E2DD] hover:bg-[#E8E4F2] transition cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5 text-[#718A68]" />
            <span>{selectedLang === "hi" ? "हिन्दी" : "English"}</span>
          </button>
        </div>

        {micError && (
          <div className="rounded-[16px] bg-[#C86B4A]/10 p-3.5 border border-[#C86B4A]/20 text-xs font-medium text-[#C86B4A] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* Real-time Voice Visualizer & Tactile Mic Button */}
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-[#E4E2DD] bg-[#F6F5F1] p-6 text-center space-y-4">
          <div className="relative">
            {isRecording && (
              <div className="absolute -inset-3 rounded-full bg-[#C86B4A]/20 animate-ping" />
            )}
            <button
              onClick={handleToggleRecord}
              className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-md transition-all duration-300 cursor-pointer ${
                isRecording
                  ? "bg-[#C86B4A] text-white scale-105 ring-4 ring-[#C86B4A]/20"
                  : "bg-[#262238] text-white hover:scale-105 hover:bg-[#342e4c] active:scale-95"
              }`}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8 animate-pulse" />
              ) : (
                <Mic className="h-8 w-8" />
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
                  className="w-1.5 rounded-full bg-[#718A68] transition-all duration-75"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-[#262238]">
              {selectedLang === "hi"
                ? "बोलने के लिए माइक दबाएं (Tap to Speak)"
                : "Tap microphone to begin speaking"}
            </p>
          )}

          {/* Live Transcript Box */}
          <div className="w-full min-h-[56px] rounded-[16px] border border-[#E4E2DD] bg-white p-3.5 text-left text-xs text-[#262238]">
            {transcript ? (
              <p className="italic font-normal">{transcript}</p>
            ) : (
              <span className="text-[#737184] italic font-normal">
                {selectedLang === "hi"
                  ? "उदा. '500 किलो टमाटर ग्रेड ए भाव 38 रुपये'..."
                  : "e.g. '500 kg Grade A tomatoes asking price 38 rupees'..."}
              </span>
            )}
          </div>
        </div>

        {/* Quick Sample Voice Buttons */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#737184] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#718A68]" />
            <span>Try Sample Voice Prompts (One-Tap Test)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleVoicePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSimulateVoice(sample.text)}
                className="rounded-full border border-[#E4E2DD] bg-[#F6F5F1] px-3.5 py-1.5 text-[11px] font-medium text-[#262238] hover:border-[#262238]/30 hover:bg-[#E8E4F2] transition cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Extracted Fields Preview */}
        {parsedData && (
          <div className="rounded-[20px] border border-[#262238]/10 bg-[#E8E4F2]/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#262238] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#718A68]" />
                <span>Extracted Produce Details</span>
              </span>
              <span className="rounded-full bg-[#262238] px-2.5 py-0.5 text-[10px] font-medium text-white">
                {parsedData.commodity ? "100% Parsed" : "Listening..."}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-[14px] bg-white p-2.5 border border-[#E4E2DD]">
                <span className="text-[#737184] text-[10px] uppercase font-medium">Commodity</span>
                <p className="font-medium text-[#262238] capitalize">
                  {parsedData.commodity || "Not detected"}
                </p>
              </div>
              <div className="rounded-[14px] bg-white p-2.5 border border-[#E4E2DD]">
                <span className="text-[#737184] text-[10px] uppercase font-medium">Grade</span>
                <p className="font-medium text-[#262238]">
                  {parsedData.grade ? `Grade ${parsedData.grade}` : "Not detected"}
                </p>
              </div>
              <div className="rounded-[14px] bg-white p-2.5 border border-[#E4E2DD]">
                <span className="text-[#737184] text-[10px] uppercase font-medium">Quantity</span>
                <p className="font-medium text-[#262238]">
                  {parsedData.available_qty ? `${parsedData.available_qty} kg` : "Not detected"}
                </p>
              </div>
              <div className="rounded-[14px] bg-white p-2.5 border border-[#E4E2DD]">
                <span className="text-[#737184] text-[10px] uppercase font-medium">Rate</span>
                <p className="font-medium text-[#262238]">
                  {parsedData.asking_price ? `₹${parsedData.asking_price}/kg` : "Not detected"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              stopAllAudio();
              onClose();
            }}
            className="rounded-full border border-[#E4E2DD] px-5 py-2.5 text-xs font-medium text-[#737184] hover:bg-[#F6F5F1] transition cursor-pointer"
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
            className="flex items-center gap-2 rounded-full bg-[#262238] px-6 py-2.5 text-xs font-medium text-white hover:bg-[#342e4c] transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <span>Apply to Listing Form</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#718A68]" />
          </button>
        </div>
      </div>
    </div>
  );
}

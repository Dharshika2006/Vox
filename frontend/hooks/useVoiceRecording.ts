"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio analysis
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  const animationFrameRef = useRef<number | null>(null);
  
  // Silence detection
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_THRESHOLD = 15; // Volume out of 255
  const SILENCE_DURATION = 1800; // ms of silence before auto-stop

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
    }
    
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    
    setIsRecording(false);
    setAudioData(new Uint8Array(0));
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    setAudioData(new Uint8Array(0));
  }, []);

  const updateAudioData = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setAudioData(new Uint8Array(dataArray)); // Create new array for React state
    
    // Silence detection logic
    const sum = dataArray.reduce((a, b) => a + b, 0);
    const average = sum / dataArray.length;
    
    if (average < SILENCE_THRESHOLD) {
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = setTimeout(() => {
          console.log("Silence detected, auto-stopping recording");
          stopRecording();
        }, SILENCE_DURATION);
      }
    } else {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  }, [isRecording, stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript(null);
    cleanup();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;
      
      // Setup Web Audio API for visualization
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
        
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          // Send to our backend for transcription
          const result = await api.voice.transcribe(audioBlob);
          setTranscript(result.transcript);
        } catch (err) {
          console.error("Transcription error:", err);
          setError("Failed to transcribe audio. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };
      
      recorder.start(100);
      setIsRecording(true);
      
      // Start visualization loop
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or not available.");
      setIsRecording(false);
    }
  }, [cleanup, updateAudioData]);



  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    audioData,
    startRecording,
    stopRecording,
    clearTranscript: () => setTranscript(null),
  };
}

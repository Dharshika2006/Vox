"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio context for silence detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    
    setIsRecording(false);
    isRecordingRef.current = false;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

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
      
      // Setup AnalyserNode for silence detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.1;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let isSilent = true;

      const checkSilence = () => {
        if (!isRecordingRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Threshold for silence
        const SILENCE_THRESHOLD = 10;
        
        if (average > SILENCE_THRESHOLD) {
          // User is speaking, clear silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          isSilent = false;
        } else {
          // User is silent
          if (!isSilent) {
            isSilent = true;
            silenceTimerRef.current = setTimeout(() => {
              if (isRecordingRef.current) {
                console.log("Silence detected, stopping recording...");
                stopRecording();
              }
            }, 1500); // 1.5 seconds of silence
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(checkSilence);
      };
      
      // Setup MediaRecorder
      const getMimeType = () => {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
        if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
        return '';
      };
      const mimeType = getMimeType();
        
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
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
      
      recorder.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      
      // Start silence detection loop
      checkSilence();
      
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or not available.");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, [cleanup, stopRecording]);

  return {
    isRecording,
    isProcessing,
    transcript,
    error,
    audioData: new Uint8Array(0), // Stubbed out to avoid breaking UI that expects it
    startRecording,
    stopRecording,
    clearTranscript: () => setTranscript(null),
  };
}

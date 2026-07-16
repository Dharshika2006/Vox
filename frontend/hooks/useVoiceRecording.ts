"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Audio Context for Silence Detection & Visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Silence Detection State
  const silenceStartRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  const SILENCE_THRESHOLD = 15; // Threshold out of 255
  const SILENCE_DURATION_MS = 1500; // 1.5 seconds of silence to stop

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    
    setIsRecording(false);
    isRecordingRef.current = false;
    isSpeakingRef.current = false;
    silenceStartRef.current = null;
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

  const monitorAudio = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    setAudioData(new Uint8Array(dataArray));
    
    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    
    const now = Date.now();
    
    if (average > SILENCE_THRESHOLD) {
      // User is speaking
      isSpeakingRef.current = true;
      silenceStartRef.current = null;
    } else {
      // User is silent
      if (isSpeakingRef.current) {
        if (silenceStartRef.current === null) {
          silenceStartRef.current = now;
        } else if (now - silenceStartRef.current > SILENCE_DURATION_MS) {
          console.log("Silence detected. Stopping recording.");
          stopRecording();
          return;
        }
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(monitorAudio);
  }, [stopRecording]);

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
      
      // Setup Web Audio API for Silence Detection
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
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
        setIsRecording(false);
        isRecordingRef.current = false;
        setIsProcessing(true);
        
        try {
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
      
      // Start monitoring audio
      monitorAudio();
      
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or not available.");
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, [cleanup, stopRecording, monitorAudio]);

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

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { MicVAD } from "@ricky0123/vad-web";

export function useVoiceRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Silero VAD
  const vadRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (vadRef.current) {
      vadRef.current.pause();
      vadRef.current.destroy();
      vadRef.current = null;
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
    
    if (vadRef.current) {
      vadRef.current.pause();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    isRecordingRef.current = false;
  }, []);

  // Visualizer is handled by CSS now or a simplified approach
  // Removed old AnalyserNode update logic for brevity

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
      
      // Setup VAD
      const myvad = await MicVAD.new({
        stream: stream,
        onSpeechEnd: (audio: any) => {
          console.log("VAD: Speech ended");
          stopRecording();
        },
      } as any);
      myvad.start();
      vadRef.current = myvad;
      
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
      
      // Visualization loop removed, VAD handles it silently
      
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

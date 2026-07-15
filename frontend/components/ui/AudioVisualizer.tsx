"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioData: Uint8Array;
  isRecording: boolean;
  className?: string;
}

export function AudioVisualizer({ audioData, isRecording, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || audioData.length === 0 || !isRecording) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const barWidth = (width / audioData.length) * 2.5;
    let barHeight;
    let x = 0;
    
    for (let i = 0; i < audioData.length; i++) {
      barHeight = (audioData[i] / 255) * height;
      
      const y = (height - barHeight) / 2;
      ctx.fillStyle = `rgba(255, 106, 26, ${Math.max(0.2, audioData[i] / 255)})`;
      
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - 1, barHeight, 4);
      ctx.fill();
      
      x += barWidth + 2;
    }
  }, [audioData, isRecording]);

  if (!isRecording) return null;

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={150} 
      className={className}
    />
  );
}

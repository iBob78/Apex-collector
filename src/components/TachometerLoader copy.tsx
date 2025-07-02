'use client';
import React from 'react';
import { useEffect, useState } from 'react';

export default function TachometerLoader() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 6) % 360);
    }, 50); // vitesse de rotation
    return () => clearInterval(interval);
  }, []);

  const needleLength = 70;
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = 100 + needleLength * Math.cos(radians);
  const y = 100 + needleLength * Math.sin(radians);

  return (
    <div className="flex items-center justify-center w-full p-6">
      <svg viewBox="0 0 200 200" className="w-64 h-64">
        {/* Fond du cadran */}
        <circle cx="100" cy="100" r="90" fill="#111" stroke="#444" strokeWidth="2" />

        {/* Graduation */}
        {[...Array(30)].map((_, i) => {
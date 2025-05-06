"use client";

import React, { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";
import Image from "next/image";

import "./styles.scss";

const inter = Inter({ subsets: ["latin"] });

export default function Loader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [positionY, setPositionY] = useState(1);
  const [direction, setDirection] = useState(1);

  const fontsReady = useRef(false);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const animate = () => {
      setPositionY((prev) => {
        const next = prev + direction * 0.3;
        if (next > 10) {
          setDirection(-1);
          return 10;
        } else if (next < 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [direction]);

  useEffect(() => {
    const checkFonts = async () => {
      await document.fonts.ready;
      fontsReady.current = true;

      if (positionY === 0) {
        setFontsLoaded(true);
      }
    };

    checkFonts();
  }, [positionY]);

  if (!fontsLoaded) {
    return (
      <div className="loader">
        <Image
          src="/meuDim.svg"
          alt="Loading"
          width={100}
          height={100}
          className="oscillating-image"
          style={{ transform: `translateY(${positionY}px)` }}
        />
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import Image from "next/image";
import { motion } from "framer-motion";

import "./styles.scss";

const inter = Inter({ subsets: ["latin"] });

export default function Loader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    const checkFonts = async () => {
      await document.fonts.ready;
      setFontsReady(true);
    };
    checkFonts();
  }, []);

  useEffect(() => {
    if (fontsReady && seconds >= 3) {
      setFontsLoaded(true);
    }
  }, [fontsReady, seconds]);

  useEffect(() => {
    if (fontsLoaded) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <div className="loader">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="oscillating-image"
        >
          <Image
            src="/meuDim.svg"
            alt="Loading"
            width={100}
            height={100}
            draggable={false}
          />
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

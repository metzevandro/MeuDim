"use client";

import { useEffect, useState } from "react";

export function FontLoader() {
  const [fontError, setFontError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fontCheck = async () => {
      try {
        await document.fonts.load('24px "Material Symbols Outlined"');
        const isLoaded = document.fonts.check(
          '24px "Material Symbols Outlined"',
        );
        if (!isLoaded) {
          setFontError(true);
          setErrorMessage(
            'A fonte "Material Symbols Outlined" não foi carregada.',
          );
        }
      } catch (error) {
        setFontError(true);
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    fontCheck();
  }, []);

  if (fontError) {
    console.error(errorMessage);
  }

  return null;
}

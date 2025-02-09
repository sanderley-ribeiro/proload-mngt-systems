
import { useState, useEffect } from "react";

export function useBarcodeScan(onScan: (barcode: string) => void) {
  const [barcode, setBarcode] = useState("");

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && barcode) {
        onScan(barcode);
        setBarcode("");
      } else if (e.key.length === 1) {
        setBarcode((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [barcode, onScan]);

  return { barcode };
}

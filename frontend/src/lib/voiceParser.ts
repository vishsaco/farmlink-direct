import { Commodity, Grade } from "./types";

export interface ParsedVoiceLot {
  commodity?: Commodity;
  grade?: Grade;
  available_qty?: number;
  asking_price?: number;
  quality_notes?: string;
  transcript: string;
  confidence: number;
}

export function parseVoiceInput(text: string): ParsedVoiceLot {
  const lower = text.toLowerCase();
  const result: ParsedVoiceLot = {
    transcript: text,
    confidence: 0.85,
  };

  // 1. Detect Commodity (Hindi + English)
  if (
    lower.includes("tomato") ||
    lower.includes("tamatar") ||
    lower.includes("टमाटर")
  ) {
    result.commodity = "tomato";
  } else if (
    lower.includes("onion") ||
    lower.includes("pyaz") ||
    lower.includes("pyaaz") ||
    lower.includes("प्याज")
  ) {
    result.commodity = "onion";
  } else if (
    lower.includes("potato") ||
    lower.includes("aloo") ||
    lower.includes("aalu") ||
    lower.includes("आलू")
  ) {
    result.commodity = "potato";
  }

  // 2. Detect Grade
  if (
    lower.includes("grade a") ||
    lower.includes("ग्रेड ए") ||
    lower.includes("ग्रेड a") ||
    lower.includes("a grade") ||
    lower.includes("premium") ||
    lower.includes("बढ़िया") ||
    lower.includes("उत्तम")
  ) {
    result.grade = "A";
  } else if (
    lower.includes("grade b") ||
    lower.includes("ग्रेड बी") ||
    lower.includes("ग्रेड b") ||
    lower.includes("b grade") ||
    lower.includes("standard")
  ) {
    result.grade = "B";
  } else if (
    lower.includes("grade c") ||
    lower.includes("ग्रेड सी") ||
    lower.includes("ग्रेड c") ||
    lower.includes("c grade") ||
    lower.includes("processing")
  ) {
    result.grade = "C";
  }

  // 3. Detect Quantity (e.g., "500 kg", "500 किलो", "500quintal", "500")
  // Match numbers followed by kg / kilo / quintal / quintals or stand-alone numbers
  const qtyPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|किलो|किग्रा|क्विंटल|quintal|quintals)/i,
    /(?:quantity|qty|मात्रा|वजन|weight)\s*(?:is|of|है)?\s*(\d+(?:\.\d+)?)/i,
    /(\d{2,5})\s*(?:kg|kilo|किलो)?/i,
  ];

  for (const pattern of qtyPatterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0) {
        // Handle quintal conversion if mentioned
        if (
          lower.includes("quintal") ||
          lower.includes("क्विंटल")
        ) {
          result.available_qty = num * 100;
        } else {
          result.available_qty = num;
        }
        break;
      }
    }
  }

  // 4. Detect Price (e.g., "38 rupees", "38 rs", "38 रुपये", "rate 38", "price 38", "भाव 38")
  const pricePatterns = [
    /(?:rs\.?|inr|₹|रुपये|रुपया|रुपए|rate|price|भाव|रेट)\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:rs|rupees|rupee|inr|₹|रुपये|रुपया|रुपए|per\s*kg|\/kg|प्रति\s*किलो)/i,
    /@\s*(\d+(?:\.\d+)?)/,
  ];

  for (const pattern of pricePatterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num > 0 && num < 1000) {
        result.asking_price = num;
        break;
      }
    }
  }

  // 5. Build Quality Notes
  const extractedPieces: string[] = [];
  if (result.commodity) extractedPieces.push(`Fresh ${result.commodity}`);
  if (result.grade) extractedPieces.push(`Grade ${result.grade}`);
  if (lower.includes("organic") || lower.includes("जैविक")) {
    extractedPieces.push("Naturally Grown / Organic");
  }
  if (lower.includes("harvested today") || lower.includes("आज का ताज़ा")) {
    extractedPieces.push("Harvested Today");
  }
  result.quality_notes =
    extractedPieces.join(" • ") || "Direct harvest lot, ready for pickup";

  return result;
}

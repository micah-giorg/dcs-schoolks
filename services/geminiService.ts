import { GoogleGenAI } from "@google/genai";
import { SchoolStatus, StatusResponse, GeminiGroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkSchoolStatus = async (): Promise<StatusResponse> => {
  const model = 'gemini-2.5-flash';
  const now = new Date();
  
  // LOGIC: If it is after 3:00 PM (15:00), check for the NEXT day.
  let targetDate = new Date(now);
  if (now.getHours() >= 15) {
    targetDate.setDate(now.getDate() + 1);
  }
  
  // Date formats for search and verification
  const fullDate = targetDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const shortDate = targetDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }); // e.g. "12/15"
  const dateWithYear = targetDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }); // e.g. "12/15/25"
  
  const prompt = `
    I need to determine the EXACT operating status for **Delaware City Schools** in **Delaware, Ohio** for **${fullDate}**.

    **Context:**
    Current System Time: ${now.toLocaleTimeString()}
    Target Date for Status: **${fullDate}** (Look for mentions of "${shortDate}" or "${dateWithYear}")

    **Task:**
    1. Check these SPECIFIC sources for "Closed" or "Delay" statuses:
       - https://www.nbc4i.com/weather/closings/ (Check this URL specifically)
       - Delaware City Schools Official Website (dcs.k12.oh.us)
       - 10TV (10tv.com)
       - ABC6 (abc6onyourside.com)
    2. Determine if schools are **CLOSED**, **DELAYED**, or **OPEN** based on the target date.

    **Search Queries:**
    - "site:nbc4i.com/weather/closings/ Delaware City Schools"
    - "Delaware City Schools 2 hour delay ${dateWithYear}"
    - "Delaware City Schools status ${shortDate}"
    - "site:dcs.k12.oh.us"
    - "site:10tv.com Delaware City Schools closings"
    - "site:abc6onyourside.com school closings"

    **Analysis Rules:**
    - **DETECT DELAYS:** Look for "2 Hour Delay", "Two Hour Delay", "Delay".
    - **DETECT CLOSURES:** Look for "Closed", "Calamity Day".
    - **MATCH DATE:** Ensure the alert applies to **${shortDate}**, **${dateWithYear}**, or "Tomorrow" (if currently previous day).
    - **PRIORITY:** A "Delay" or "Closed" finding on ANY major source (District, NBC4, 10TV) overrides "Open".

    **Output Format:**
    STATUS: [OPEN or CLOSED or DELAYED]
    
    SOURCE_EVALUATION: dcs.k12.oh.us | [OPEN/CLOSED/DELAYED/UNKNOWN]
    SOURCE_EVALUATION: 10tv.com | [OPEN/CLOSED/DELAYED/UNKNOWN]
    SOURCE_EVALUATION: nbc4i.com | [OPEN/CLOSED/DELAYED/UNKNOWN]
    SOURCE_EVALUATION: abc6onyourside.com | [OPEN/CLOSED/DELAYED/UNKNOWN]
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Parse the status
    let status = SchoolStatus.UNKNOWN;
    if (text.includes("STATUS: OPEN")) status = SchoolStatus.OPEN;
    else if (text.includes("STATUS: CLOSED")) status = SchoolStatus.CLOSED;
    else if (text.includes("STATUS: DELAYED")) status = SchoolStatus.DELAYED;

    // Parse Source Evaluations
    const sourceEvaluations = new Map<string, SchoolStatus>();
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('SOURCE_EVALUATION:')) {
        const parts = line.split('|');
        if (parts.length >= 2) {
          const domainKey = parts[0].replace('SOURCE_EVALUATION:', '').trim().toLowerCase();
          let sourceStatus = SchoolStatus.UNKNOWN;
          const statusStr = parts[1].trim().toUpperCase();
          
          if (statusStr.includes('OPEN')) sourceStatus = SchoolStatus.OPEN;
          else if (statusStr.includes('CLOSED')) sourceStatus = SchoolStatus.CLOSED;
          else if (statusStr.includes('DELAY')) sourceStatus = SchoolStatus.DELAYED;
          
          sourceEvaluations.set(domainKey, sourceStatus);
        }
      }
    }

    // Extract sources from grounding metadata and apply status
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GeminiGroundingChunk[] | undefined;
    
    const sources = rawChunks
      ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => {
        const uri = chunk.web?.uri || "";
        const lowerUri = uri.toLowerCase();
        let sourceStatus = SchoolStatus.UNKNOWN;

        // Attempt to match URI to our evaluated domains
        for (const [domain, st] of sourceEvaluations.entries()) {
          if (lowerUri.includes(domain)) {
            sourceStatus = st;
            break;
          }
        }

        return {
          title: chunk.web?.title || "Source",
          uri: uri,
          status: sourceStatus
        };
      }) || [];

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      status,
      summary: "", // Summary removed from UI, no need to parse
      sources: uniqueSources,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkedDate: fullDate,
    };

  } catch (error) {
    console.error("Error checking school status:", error);
    return {
      status: SchoolStatus.UNKNOWN,
      summary: "",
      sources: [],
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkedDate: fullDate,
    };
  }
};
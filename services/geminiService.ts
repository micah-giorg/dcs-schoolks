import { GoogleGenAI } from "@google/genai";
import { SchoolStatus, StatusResponse, GeminiGroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkSchoolStatus = async (): Promise<StatusResponse> => {
  const model = 'gemini-2.5-flash';
  const now = new Date();
  
  // LOGIC: If it is after 3:00 PM (15:00), check for the NEXT day.
<<<<<<< HEAD
  // This handles the "night before" check for delays.
=======
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
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
<<<<<<< HEAD
    Perform a targeted Google Search to find if schools are **CLOSED** or **DELAYED**.
    Specifically check for the phrase "2 hour delay" associated with the target date.

    **Search Queries:**
=======
    1. Check these SPECIFIC sources for "Closed" or "Delay" statuses:
       - https://www.nbc4i.com/weather/closings/ (Check this URL specifically)
       - Delaware City Schools Official Website (dcs.k12.oh.us)
       - 10TV (10tv.com)
       - ABC6 (abc6onyourside.com)
    2. Determine if schools are **CLOSED**, **DELAYED**, or **OPEN** based on the target date.

    **Search Queries:**
    - "site:nbc4i.com/weather/closings/ Delaware City Schools"
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
    - "Delaware City Schools 2 hour delay ${dateWithYear}"
    - "Delaware City Schools status ${shortDate}"
    - "site:dcs.k12.oh.us"
    - "site:10tv.com Delaware City Schools closings"
<<<<<<< HEAD
    - "site:nbc4i.com Delaware City Schools closings"
    - "Delaware City Schools Facebook"

    **Analysis Rules (Strict):**
    1. **DETECT DELAYS:** Look for "2 Hour Delay", "Two Hour Delay", "Delay", "Closed".
    2. **MATCH DATE:** The alert must apply to **${shortDate}** or **${dateWithYear}** or "Tomorrow" (if the article is from today).
    3. **SPECIFIC PHRASE:** If you see a snippet containing "2 hour delay ${dateWithYear}" or similar, immediately report status as **DELAYED**.
    4. **SOURCE CHECK:** Check snippets from dcs.k12.oh.us, 10tv.com, nbc4i.com, abc6onyourside.com.
    5. **DEFAULT:** Only if ALL sources explicitly show NO alerts for this date, assume OPEN.

    **Response Format:**
    STATUS: [OPEN or CLOSED or DELAYED]
    SUMMARY: [Explain the finding. E.g., "The district website reports a 2-hour delay for ${shortDate}."]
=======
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
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
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

<<<<<<< HEAD
    // Parse the summary
    const summaryMatch = text.split("SUMMARY:");
    const summary = summaryMatch.length > 1 ? summaryMatch[1].trim() : "Unable to retrieve specific details.";

    // Extract sources from grounding metadata
=======
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
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GeminiGroundingChunk[] | undefined;
    
    const sources = rawChunks
      ?.filter(chunk => chunk.web?.uri && chunk.web?.title)
<<<<<<< HEAD
      .map(chunk => ({
        title: chunk.web?.title || "Source",
        uri: chunk.web?.uri || "#"
      })) || [];
=======
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
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      status,
<<<<<<< HEAD
      summary,
=======
      summary: "", // Summary removed from UI, no need to parse
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
      sources: uniqueSources,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkedDate: fullDate,
    };

  } catch (error) {
    console.error("Error checking school status:", error);
    return {
      status: SchoolStatus.UNKNOWN,
<<<<<<< HEAD
      summary: "An error occurred while cross-referencing news sources.",
=======
      summary: "",
>>>>>>> a1f8e1f46a5d3f79a405852c761abdf64c0bdb8d
      sources: [],
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      checkedDate: fullDate,
    };
  }
};
/**
 * @author ColdByDefault
 * @copyright  2026 ColdByDefault. All Rights Reserved.
 * @license - All Rights Reserved
 */
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Client } from "@notionhq/client";
import { MEETING_ANALYSIS_PROMPT, MeetingAnalysis } from "@/lib/prompts";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// In development, use the configured database ID as fallback
// In production, users MUST provide their own database ID
const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

interface ProcessingResponse {
  success: boolean;
  data?: {
    transcript: string;
    analysis: MeetingAnalysis;
    notionPageUrl?: string;
  };
  error?: string;
  isDemo?: boolean;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ProcessingResponse>> {
  try {
    // Check if demo mode
    const isDemo = request.headers.get("x-demo-mode") === "true";

    if (isDemo) {
      return NextResponse.json(getDemoResponse());
    }

    // Get the form data with the audio file
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "Keine Audiodatei bereitgestellt" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/mp4",
    ];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ungültiger Dateityp. Bitte laden Sie MP3-, WAV- oder M4A-Dateien hoch.",
        },
        { status: 400 }
      );
    }

    // Step 1: Transcribe with Groq Whisper
    const transcript = await transcribeAudio(audioFile);

    // Step 2: Analyze with LLM
    const analysis = await analyzeMeeting(transcript);

    // Step 3: Send to Notion
    // Use custom database ID from header if provided
    const customDatabaseId = request.headers.get("x-notion-database-id");

    // In production, users MUST provide their own database ID
    // In development, fall back to the configured database ID
    let databaseId: string | undefined;
    if (isProduction) {
      if (!customDatabaseId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Notion-Datenbank-ID erforderlich. Bitte geben Sie Ihre eigene Notion-Datenbank-ID an.",
          },
          { status: 400 }
        );
      }
      databaseId = customDatabaseId;
    } else {
      databaseId = customDatabaseId || NOTION_DATABASE_ID;
    }

    let notionPageUrl: string | undefined;
    if (process.env.NOTION_API_KEY && databaseId) {
      notionPageUrl = await createNotionPage(transcript, analysis, databaseId);
    }

    return NextResponse.json({
      success: true,
      data: {
        transcript,
        analysis,
        notionPageUrl,
      },
    });
  } catch (error) {
    console.error("Error processing meeting:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Meeting konnte nicht verarbeitet werden",
      },
      { status: 500 }
    );
  }
}

// Step 1.2: Transcribe audio using Groq Whisper
async function transcribeAudio(audioFile: File): Promise<string> {
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3",
    // No language specified = auto-detect (supports German, English, etc.)
    response_format: "text",
  });

  return transcription as unknown as string;
}

// Step 1.3: Analyze meeting using Groq LLM
async function analyzeMeeting(transcript: string): Promise<MeetingAnalysis> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // Fast and capable
    messages: [
      { role: "system", content: MEETING_ANALYSIS_PROMPT },
      { role: "user", content: `Transcript:\n\n${transcript}` },
    ],
    temperature: 0.3, // Lower for more consistent output
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Keine Antwort von der KI-Analyse");
  }

  return JSON.parse(content) as MeetingAnalysis;
}

// Demo response for portfolio visitors
function getDemoResponse(): ProcessingResponse {
  return {
    success: true,
    isDemo: true,
    data: {
      transcript: `[Demo-Transkript]
      
Sarah: Guten Morgen zusammen. Lassen Sie uns den Zeitplan für die Produkteinführung im ersten Quartal besprechen.

Mike: Ich habe die ersten Designs fertiggestellt. Wir sind auf Kurs für den Meilenstein am 15. Januar.

Sarah: Ausgezeichnet! Was ist mit den Marketingmaterialien?

Lisa: Die Social-Media-Kampagne ist bereit. Ich brauche nur noch die endgültige Freigabe vom Markenteam bis Freitag.

Mike: Ich werde mich mit der Technik abstimmen, um sicherzustellen, dass die API bis nächste Woche stabil ist.

Sarah: Perfekt. Lassen Sie uns am Montag wieder zusammenkommen, um den Fortschritt zu überprüfen. Ich habe ein gutes Gefühl bei diesem Launch!`,
      analysis: {
        summary:
          "Das Team besprach den Zeitplan für die Produkteinführung im ersten Quartal und bestätigte, dass sie auf Kurs für den Meilenstein am 15. Januar sind. Die Designarbeit ist abgeschlossen, und die Marketingmaterialien sind bereit und warten auf die Markenfreigabe.",
        actionItems: [
          "Lisa soll die endgültige Freigabe vom Markenteam bis Freitag einholen",
          "Mike soll sich mit der Technik für API-Stabilität bis nächste Woche abstimmen",
          "Team soll sich am Montag wieder treffen, um den Fortschritt zu überprüfen",
        ],
        sentiment: "positive",
        sentimentExplanation:
          "Das Meeting hatte einen optimistischen und produktiven Ton mit klaren Aktionspunkten und selbstbewusster Führung.",
      },
      notionPageUrl: "https://notion.so/demo-page",
    },
  };
}

// Step 1.4: Create Notion page with meeting notes
async function createNotionPage(
  transcript: string,
  analysis: MeetingAnalysis,
  databaseId: string
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];
  const meetingTitle = `Meeting-Notizen - ${today}`;

  // Capitalize sentiment for Notion (positive -> Positive)
  const notionSentiment =
    analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1);

  const response = await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      // Title property - matches your "Meeting name" column
      "Meeting name": {
        title: [
          {
            text: {
              content: meetingTitle,
            },
          },
        ],
      },
      // Date property - matches your "Meeting date" column
      "Meeting date": {
        date: {
          start: today,
        },
      },
      // Sentiment property - matches your "Sentiment" column with capitalized options
      Sentiment: {
        select: {
          name:
            analysis.sentiment === "positive"
              ? "Positiv"
              : analysis.sentiment === "negative"
              ? "Negativ"
              : "Neutral", // "Positiv", "Neutral", or "Negativ"
        },
      },
    },
    // Page content (blocks) - this is where the summary, action items go
    children: [
      // Executive Summary section
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Zusammenfassung" } }],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: analysis.summary } }],
        },
      },
      // Divider
      {
        object: "block",
        type: "divider",
        divider: {},
      },
      // Action Items section
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: "Aktionspunkte" } }],
        },
      },
      // Action items as to-do blocks
      ...analysis.actionItems.map((item) => ({
        object: "block" as const,
        type: "to_do" as const,
        to_do: {
          rich_text: [{ type: "text" as const, text: { content: item } }],
          checked: false,
        },
      })),
      // Divider
      {
        object: "block",
        type: "divider",
        divider: {},
      },
      // Sentiment section
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: `Stimmung: ${
                  analysis.sentiment === "positive"
                    ? "Positiv"
                    : analysis.sentiment === "negative"
                    ? "Negativ"
                    : "Neutral"
                }`,
              },
            },
          ],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { type: "text", text: { content: analysis.sentimentExplanation } },
          ],
        },
      },
      // Divider
      {
        object: "block",
        type: "divider",
        divider: {},
      },
      // Full Transcript
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            { type: "text", text: { content: "Vollständiges Transkript" } },
          ],
        },
      },
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            { type: "text", text: { content: transcript.slice(0, 2000) } },
          ],
        },
      },
    ],
  } as Parameters<typeof notion.pages.create>[0]);

  // Return the Notion page URL
  return `https://notion.so/${response.id.replace(/-/g, "")}`;
}

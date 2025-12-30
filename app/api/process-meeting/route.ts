import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Client } from "@notionhq/client";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const NOTION_DATABASE_ID =
  process.env.NOTION_DATABASE_ID || "2d91b61a25328092a1bdcb649dbacdb2";

// Types for the meeting analysis response
interface MeetingAnalysis {
  summary: string;
  actionItems: string[];
  sentiment: "positive" | "neutral" | "negative";
  sentimentExplanation: string;
}

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
        { success: false, error: "No audio file provided" },
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
          error: "Invalid file type. Please upload MP3, WAV, or M4A files.",
        },
        { status: 400 }
      );
    }

    // Step 1: Transcribe with Groq Whisper
    const transcript = await transcribeAudio(audioFile);

    // Step 2: Analyze with LLM
    const analysis = await analyzeMeeting(transcript);

    // Step 3: Send to Notion
    // Use custom database ID from header if provided, otherwise use default
    const customDatabaseId = request.headers.get("x-notion-database-id");
    const databaseId = customDatabaseId || NOTION_DATABASE_ID;

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
          error instanceof Error ? error.message : "Failed to process meeting",
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
    language: "en", // Can be made dynamic
    response_format: "text",
  });

  return transcription as unknown as string;
}

// Step 1.3: Analyze meeting using Groq LLM
async function analyzeMeeting(transcript: string): Promise<MeetingAnalysis> {
  const systemPrompt = `You are an executive assistant specializing in meeting analysis.
Analyze the following meeting transcript and extract:

1. **Summary**: A concise 3-sentence executive summary of what was discussed.
2. **Action Items**: A list of specific tasks that were assigned or need to be done. Each should include WHO needs to do WHAT.
3. **Sentiment**: The overall emotional tone of the meeting (positive, neutral, or negative) with a brief explanation.

Respond ONLY with valid JSON in this exact format:
{
  "summary": "string",
  "actionItems": ["string", "string"],
  "sentiment": "positive" | "neutral" | "negative",
  "sentimentExplanation": "string"
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile", // Fast and capable
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Meeting Transcript:\n\n${transcript}` },
    ],
    temperature: 0.3, // Lower for more consistent output
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI analysis");
  }

  return JSON.parse(content) as MeetingAnalysis;
}

// Demo response for portfolio visitors
function getDemoResponse(): ProcessingResponse {
  return {
    success: true,
    isDemo: true,
    data: {
      transcript: `[Demo Transcript]
      
Sarah: Good morning everyone. Let's discuss the Q1 product launch timeline.

Mike: I've finished the initial designs. We're on track for the January 15th milestone.

Sarah: Excellent! What about the marketing materials?

Lisa: The social media campaign is ready. I just need final approval from the brand team by Friday.

Mike: I'll coordinate with engineering to make sure the API is stable by next week.

Sarah: Perfect. Let's reconvene next Monday to check progress. I'm feeling good about this launch!`,
      analysis: {
        summary:
          "The team discussed the Q1 product launch timeline and confirmed they are on track for the January 15th milestone. Design work is complete, and marketing materials are ready pending brand approval. The team will reconvene Monday to review progress.",
        actionItems: [
          "Lisa: Get final approval from brand team by Friday",
          "Mike: Coordinate with engineering for API stability by next week",
          "All: Reconvene Monday to check progress",
        ],
        sentiment: "positive",
        sentimentExplanation:
          "The meeting had an optimistic and productive tone. Participants reported being on track, and the leader expressed confidence about the launch.",
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
  const meetingTitle = `Meeting Notes - ${today}`;

  // Map sentiment to match your Notion select options (lowercase)
  const sentimentValue = analysis.sentiment; // "positive", "neutral", or "negative"

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
            analysis.sentiment.charAt(0).toUpperCase() +
            analysis.sentiment.slice(1), // "Positive", "Neutral", or "Negative"
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
          rich_text: [{ type: "text", text: { content: "Executive Summary" } }],
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
          rich_text: [{ type: "text", text: { content: "Action Items" } }],
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
                content: `Sentiment: ${
                  analysis.sentiment.charAt(0).toUpperCase() +
                  analysis.sentiment.slice(1)
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
          rich_text: [{ type: "text", text: { content: "Full Transcript" } }],
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

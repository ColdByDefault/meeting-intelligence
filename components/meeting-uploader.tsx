/**
 * @author ColdByDefault
 * @copyright  2026 ColdByDefault. All Rights Reserved.
 * @license - All Rights Reserved
 */ 
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileAudio,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types matching the API response
interface MeetingAnalysis {
  summary: string;
  actionItems: string[];
  sentiment: "positive" | "neutral" | "negative";
  sentimentExplanation: string;
}

interface ProcessingResult {
  transcript: string;
  analysis: MeetingAnalysis;
  notionPageUrl?: string;
}

type ProcessingStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "analyzing"
  | "creating-notion"
  | "complete"
  | "error";

interface MeetingUploaderProps {
  demoMode?: boolean;
  notionDatabaseId?: string;
  maxDurationSeconds?: number;
  disabled?: boolean;
  onComplete?: (result: ProcessingResult) => void;
}

const statusMessages: Record<ProcessingStatus, string> = {
  idle: "Legen Sie Ihre Audiodatei hier ab",
  uploading: "Datei wird hochgeladen...",
  transcribing: "Audio wird mit KI transkribiert...",
  analyzing: "Meeting-Inhalt wird analysiert...",
  "creating-notion": "Notion-Seite wird erstellt...",
  complete: "Verarbeitung abgeschlossen!",
  error: "Etwas ist schiefgelaufen",
};

const statusProgress: Record<ProcessingStatus, number> = {
  idle: 0,
  uploading: 20,
  transcribing: 40,
  analyzing: 60,
  "creating-notion": 80,
  complete: 100,
  error: 0,
};

export function MeetingUploader({
  demoMode = false,
  notionDatabaseId,
  maxDurationSeconds = 60,
  disabled = false,
  onComplete,
}: MeetingUploaderProps) {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Check audio duration
  const checkAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audio.src);
        reject(new Error("Could not load audio file"));
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setResult(null);

    try {
      // Check duration limit (only in non-demo mode)
      if (!demoMode && maxDurationSeconds) {
        const duration = await checkAudioDuration(file);
        if (duration > maxDurationSeconds) {
          throw new Error(
            `Audio zu lang! Maximal ${maxDurationSeconds} Sekunden erlaubt. Ihre Datei ist ${Math.round(
              duration
            )} Sekunden lang.`
          );
        }
      }

      // Step 1: Upload
      setStatus("uploading");
      await simulateDelay(500);

      // Step 2: Transcribe
      setStatus("transcribing");

      const formData = new FormData();
      formData.append("audio", file);

      const headers: HeadersInit = {};
      if (demoMode) {
        headers["x-demo-mode"] = "true";
      }
      if (notionDatabaseId) {
        headers["x-notion-database-id"] = notionDatabaseId;
      }

      const response = await fetch("/api/process-meeting", {
        method: "POST",
        headers,
        body: formData,
      });

      // Step 3: Analyzing
      setStatus("analyzing");
      await simulateDelay(300);

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Meeting konnte nicht verarbeitet werden"
        );
      }

      // Step 4: Creating Notion page
      setStatus("creating-notion");
      await simulateDelay(300);

      // Complete!
      setStatus("complete");
      setResult(data.data);
      onComplete?.(data.data);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Ein unerwarteter Fehler ist aufgetreten"
      );
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        processFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, notionDatabaseId, maxDurationSeconds]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".mp4", ".mpeg", ".webm"],
    },
    maxFiles: 1,
    disabled:
      disabled ||
      (status !== "idle" && status !== "complete" && status !== "error"),
  });

  const reset = () => {
    setStatus("idle");
    setError(null);
    setResult(null);
    setFileName(null);
  };

  const isProcessing = !["idle", "complete", "error"].includes(status);
  const isDisabled = disabled || isProcessing;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-all duration-200",
          isDragActive && "border-primary bg-primary/5",
          isDisabled && "cursor-not-allowed opacity-70",
          status === "complete" && "border-green-500 bg-green-500/5",
          status === "error" && "border-red-500 bg-red-500/5"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <input {...getInputProps()} />

          {/* Icon */}
          <div className="mb-4">
            {status === "idle" && (
              <Upload
                className={cn(
                  "h-12 w-12 text-muted-foreground",
                  isDragActive && "text-primary"
                )}
              />
            )}
            {isProcessing && (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
            {status === "complete" && (
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>

          {/* Status Message */}
          <h3 className="text-lg font-semibold mb-2">
            {statusMessages[status]}
          </h3>

          {/* File Name */}
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <FileAudio className="h-4 w-4" />
              <span>{fileName}</span>
            </div>
          )}

          {/* Idle State Instructions */}
          {status === "idle" && (
            <p className="text-sm text-muted-foreground">
              Unterstützt MP3, WAV, M4A Dateien (max. 25MB)
            </p>
          )}

          {/* Error Message */}
          {status === "error" && error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="w-full max-w-xs mt-4">
              <Progress value={statusProgress[status]} className="h-2" />
            </div>
          )}

          {/* Reset Button */}
          {(status === "complete" || status === "error") && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              variant="outline"
              className="mt-4"
            >
              Weitere Datei hochladen
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Demo Mode Badge */}
      {demoMode && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            🎭 Demo-Modus - Beispieldaten werden verwendet
          </Badge>
        </div>
      )}

      {/* Results Card */}
      {result && <ResultsCard result={result} />}
    </div>
  );
}

// Results display component
function ResultsCard({ result }: { result: ProcessingResult }) {
  const sentimentEmoji = {
    positive: "😊",
    neutral: "😐",
    negative: "😟",
  };

  const sentimentColor = {
    positive:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Summary */}
        <div>
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
            📋 Zusammenfassung
          </h4>
          <p className="text-muted-foreground">{result.analysis.summary}</p>
        </div>

        {/* Action Items */}
        <div>
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
            ✅ Aktionspunkte
          </h4>
          <ul className="space-y-2">
            {result.analysis.actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sentiment */}
        <div>
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
            Stimmung
            <Badge className={sentimentColor[result.analysis.sentiment]}>
              {sentimentEmoji[result.analysis.sentiment]}{" "}
              {result.analysis.sentiment === "positive"
                ? "positiv"
                : result.analysis.sentiment === "negative"
                ? "negativ"
                : "neutral"}
            </Badge>
          </h4>
          <p className="text-muted-foreground">
            {result.analysis.sentimentExplanation}
          </p>
        </div>

        {/* Notion Link */}
        {result.notionPageUrl && (
          <div className="pt-4 border-t">
            <a
              href={result.notionPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              📝 In Notion anzeigen →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper to simulate progress steps
function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

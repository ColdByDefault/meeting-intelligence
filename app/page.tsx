/**
 * @author ColdByDefault
 * @copyright  2026 ColdByDefault. All Rights Reserved.
 * @license - All Rights Reserved
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { MeetingUploader } from "@/components/meeting-uploader";
import { NotionSetupInfo } from "@/components/notion-setup-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Sparkles, FileText, Zap, Info, AlertCircle } from "lucide-react";

// Check if we're in production mode (users must provide their own Notion ID)
const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";

export default function Home() {
  const [demoMode, setDemoMode] = useState(true);
  const [notionDatabaseId, setNotionDatabaseId] = useState("");
  const [showNotionHelp, setShowNotionHelp] = useState(false);

  // In production, users MUST provide their own Notion Database ID when demo is off
  const notionIdRequired = isProduction && !demoMode;
  const notionIdMissing = notionIdRequired && !notionDatabaseId.trim();

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Meeting-Intelligenz</span>
          </div>
          {/* Demo Mode Toggle - Moved to navbar */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Demo
            </span>
            <Button
              variant={demoMode ? "default" : "outline"}
              size="sm"
              onClick={() => setDemoMode(!demoMode)}
            >
              {demoMode ? "ON" : "OFF"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Von der Sprachnachricht zu{" "}
            <span className="text-primary">Notion-Notizen</span>
            <br />
            in 30 Sekunden
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Laden Sie Ihre Meeting-Aufnahme hoch und lassen Sie die KI
            Aktionspunkte, Zusammenfassungen und Erkenntnisse
            extrahieren—automatisch mit Ihrem Notion-Workspace synchronisiert.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <FeaturePill
              icon={<Sparkles className="h-4 w-4" />}
              text="KI-gestützte Analyse"
            />
            <FeaturePill
              icon={<FileText className="h-4 w-4" />}
              text="Notion-Integration"
            />
            <FeaturePill
              icon={<Zap className="h-4 w-4" />}
              text="60 Sekunden Verarbeitung"
            />
          </div>

          {/* Demo Mode Info */}
          {demoMode && (
            <p className="text-sm text-muted-foreground mb-4">
              🎭 <strong>Demo-Modus:</strong> Laden Sie eine beliebige
              Audiodatei hoch, um Beispielergebnisse zu sehen
            </p>
          )}

          {/* Notion Database ID Input - Only when Demo OFF */}
          {!demoMode && (
            <div className="max-w-md mx-auto mb-8 space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="notion-id" className="text-sm font-medium">
                  Ihre Notion-Datenbank-ID
                  {isProduction && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <button
                  onClick={() => setShowNotionHelp(!showNotionHelp)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="So erhalten Sie Ihre Notion-Datenbank-ID"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <Input
                id="notion-id"
                type="text"
                placeholder="e.g., 2d91b61a25328092a1bdcb649dbacdb2"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                className={`font-mono text-sm ${
                  notionIdMissing ? "border-destructive" : ""
                }`}
              />
              {notionIdMissing && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Notion-Datenbank-ID ist erforderlich, um Ihre Audiodatei zu
                  verarbeiten
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                ⏱️ Max. Audiolänge: 1 Minute
              </p>
            </div>
          )}

          {/* Notion Setup Help Modal */}
          {showNotionHelp && (
            <NotionSetupInfo onClose={() => setShowNotionHelp(false)} />
          )}
        </div>

        {/* Uploader Component */}
        <MeetingUploader
          demoMode={demoMode}
          notionDatabaseId={!demoMode ? notionDatabaseId : undefined}
          maxDurationSeconds={60}
          disabled={notionIdMissing}
        />

        {/* How It Works Section */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            So funktioniert es
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Audio hochladen"
              description="Legen Sie Ihre Meeting-Aufnahme ab (MP3, M4A, WAV)"
            />
            <StepCard
              number="2"
              title="KI-Verarbeitung"
              description="Whisper transkribiert, LLM analysiert den Inhalt"
            />
            <StepCard
              number="3"
              title="Notion-Seite"
              description="Zusammenfassung & Aktionspunkte erscheinen in Ihrem Workspace"
            />
          </div>
        </section>

        {/* Future Features Preview */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            Demnächst verfügbar
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Erweiterbar konzipiert—fügen Sie Ihre eigenen Integrationen hinzu
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <ComingSoonPill text="📧 Zusammenfassung per E-Mail an Teilnehmer" />
            <ComingSoonPill text="📊 An CRM senden" />
            <ComingSoonPill text="📅 Kalenderaufgaben erstellen" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p>Erstellt mit Next.js, Groq Cloud und Notion API</p>
            <p>
              Ein Portfolio-Demo von{" "}
              <Link
                href="https://coldbydefault.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Yazan Abo Ayash
              </Link>
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} ColdByDefault. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
      {icon}
      {text}
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ComingSoonPill({ text }: { text: string }) {
  return (
    <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-muted-foreground">
      {text}
    </div>
  );
}

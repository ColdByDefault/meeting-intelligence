"use client";

import { useState } from "react";
import { MeetingUploader } from "@/components/meeting-uploader";
import { NotionSetupInfo } from "@/components/notion-setup-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, Sparkles, FileText, Zap, Info } from "lucide-react";

export default function Home() {
  const [demoMode, setDemoMode] = useState(true);
  const [notionDatabaseId, setNotionDatabaseId] = useState("");
  const [showNotionHelp, setShowNotionHelp] = useState(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Meeting Intelligence</span>
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
            From Voice Memo to{" "}
            <span className="text-primary">Notion Notes</span>
            <br />
            in 30 Seconds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Upload your meeting recording and let AI extract action items,
            summaries, and insights—automatically synced to your Notion
            workspace.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <FeaturePill
              icon={<Sparkles className="h-4 w-4" />}
              text="AI-Powered Analysis"
            />
            <FeaturePill
              icon={<FileText className="h-4 w-4" />}
              text="Notion Integration"
            />
            <FeaturePill
              icon={<Zap className="h-4 w-4" />}
              text="60 Second Processing"
            />
          </div>

          {/* Demo Mode Info */}
          {demoMode && (
            <p className="text-sm text-muted-foreground mb-4">
              🎭 <strong>Demo Mode:</strong> Upload any audio to see sample
              results
            </p>
          )}

          {/* Notion Database ID Input - Only when Demo OFF */}
          {!demoMode && (
            <div className="max-w-md mx-auto mb-8 space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="notion-id" className="text-sm font-medium">
                  Your Notion Database ID
                </Label>
                <button
                  onClick={() => setShowNotionHelp(!showNotionHelp)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="How to get your Notion Database ID"
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
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                ⏱️ Max audio length: 1 minute
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
        />

        {/* How It Works Section */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Upload Audio"
              description="Drop your meeting recording (MP3, M4A, WAV)"
            />
            <StepCard
              number="2"
              title="AI Processing"
              description="Whisper transcribes, LLM analyzes content"
            />
            <StepCard
              number="3"
              title="Notion Page"
              description="Summary & action items appear in your workspace"
            />
          </div>
        </section>

        {/* Future Features Preview */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Coming Soon</h2>
          <p className="text-center text-muted-foreground mb-8">
            Extensible by design—add your own integrations
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <ComingSoonPill text="📧 Email Summary to Attendees" />
            <ComingSoonPill text="📊 Send to CRM" />
            <ComingSoonPill text="📅 Create Calendar Tasks" />
            <ComingSoonPill text="💬 Slack Notifications" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Groq Cloud, and Notion API</p>
          <p className="mt-2">
            A portfolio demo by{" "}
            <a href="#" className="text-primary hover:underline">
              Yazan
            </a>
          </p>
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

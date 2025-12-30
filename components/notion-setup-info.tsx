"use client";

import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotionSetupInfoProps {
  onClose: () => void;
}

export function NotionSetupInfo({ onClose }: NotionSetupInfoProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">
            🔗 How to Connect Your Notion
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                1
              </span>
              Create a Notion Integration
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Go to{" "}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                notion.so/my-integrations
                <ExternalLink className="h-3 w-3" />
              </a>{" "}
              and click <strong>&quot;New integration&quot;</strong>
            </p>
            <ul className="text-sm text-muted-foreground ml-8 list-disc list-inside space-y-1">
              <li>Name it &quot;Meeting Intelligence&quot;</li>
              <li>Select your workspace</li>
              <li>Click &quot;Submit&quot;</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                2
              </span>
              Create a Database for Meeting Notes
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              In Notion, create a new <strong>full-page database</strong> (not
              inline). This is where your meeting notes will be saved.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                3
              </span>
              Connect Database to Integration
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              On your database page:
            </p>
            <ul className="text-sm text-muted-foreground ml-8 list-disc list-inside space-y-1">
              <li>
                Click the <strong>&quot;...&quot;</strong> menu (top right)
              </li>
              <li>
                Go to <strong>&quot;Add connections&quot;</strong>
              </li>
              <li>
                Select <strong>&quot;Meeting Intelligence&quot;</strong>
              </li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                4
              </span>
              Get Your Database ID
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Copy the URL of your database page. The ID is the part after your
              workspace name:
            </p>
            <div className="ml-8 p-3 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
              <span className="text-muted-foreground">
                notion.so/yourworkspace/
              </span>
              <span className="text-primary font-bold">
                2d91b61a25328092a1bdcb649dbacdb2
              </span>
              <span className="text-muted-foreground">?v=...</span>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Copy just the <strong>32-character ID</strong> and paste it in the
              input field.
            </p>
          </div>

          {/* Important Note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Important
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              For this demo to write to YOUR Notion, you would need to provide
              your own Notion API key. Currently, this app uses the owner&apos;s
              integration. Contact the owner if you want a fully personalized
              setup.
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Got it!</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

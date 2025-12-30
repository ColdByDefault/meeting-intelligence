/**
 * @author ColdByDefault
 * @copyright  2026 ColdByDefault. All Rights Reserved.
 * @license - All Rights Reserved
 */
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
            🔗 So verbinden Sie Ihr Notion
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
              Notion-Integration erstellen
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Gehen Sie zu{" "}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                notion.so/my-integrations
                <ExternalLink className="h-3 w-3" />
              </a>{" "}
              und klicken Sie auf <strong>&quot;Neue Integration&quot;</strong>
            </p>
            <ul className="text-sm text-muted-foreground ml-8 list-disc list-inside space-y-1">
              <li>Nennen Sie sie &quot;Meeting-Intelligenz&quot;</li>
              <li>Wählen Sie Ihren Workspace</li>
              <li>Klicken Sie auf &quot;Absenden&quot;</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                2
              </span>
              Datenbank für Meeting-Notizen erstellen
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Erstellen Sie in Notion eine neue{" "}
              <strong>ganzseitige Datenbank</strong> (nicht inline). Hier werden
              Ihre Meeting-Notizen gespeichert.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                3
              </span>
              Datenbank mit Integration verbinden
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Auf Ihrer Datenbankseite:
            </p>
            <ul className="text-sm text-muted-foreground ml-8 list-disc list-inside space-y-1">
              <li>
                Klicken Sie auf das <strong>&quot;...&quot;</strong>-Menü (oben
                rechts)
              </li>
              <li>
                Gehen Sie zu{" "}
                <strong>&quot;Verbindungen hinzufügen&quot;</strong>
              </li>
              <li>
                Wählen Sie <strong>&quot;Meeting-Intelligenz&quot;</strong>
              </li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                4
              </span>
              Ihre Datenbank-ID abrufen
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Kopieren Sie die URL Ihrer Datenbankseite. Die ID ist der Teil
              nach Ihrem Workspace-Namen:
            </p>
            <div className="ml-8 p-3 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
              <span className="text-muted-foreground">
                notion.so/ihrworkspace/
              </span>
              <span className="text-primary font-bold">
                2d91b61a25328092a1bdcb649dbacdb2
              </span>
              <span className="text-muted-foreground">?v=...</span>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Kopieren Sie nur die <strong>32-stellige ID</strong> und fügen Sie
              sie in das Eingabefeld ein.
            </p>
          </div>

          {/* Important Note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              ⚠️ Wichtig
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Damit diese Demo in IHR Notion schreiben kann, müssten Sie Ihren
              eigenen Notion-API-Schlüssel bereitstellen. Derzeit verwendet
              diese App die Integration des Eigentümers. Kontaktieren Sie den
              Eigentümer, wenn Sie eine vollständig personalisierte Einrichtung
              wünschen.
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Verstanden!</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

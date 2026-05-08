import { SettingsForm } from "@/components/settings/settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettings } from "@/lib/services/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            Configure paper sources, keyword radar, review scheduling rules, export behavior, and theme profile.
          </p>
        </CardContent>
      </Card>

      <SettingsForm
        initial={{
          paperSources: settings.paperSources,
          searchKeywords: settings.searchKeywords,
          dailyPaperLimit: settings.dailyPaperLimit,
          llmModel: settings.llmModel,
          reviewRules: settings.reviewRules,
          exportSettings: {
            format: settings.exportSettings.format as "json" | "csv" | "xlsx" | "docx",
            includeExplanations: Boolean(settings.exportSettings.includeExplanations)
          },
          theme: settings.theme as "neural-lab" | "oceanic-grid" | "classic-dark"
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SettingsPayload = {
  paperSources: string[];
  searchKeywords: string[];
  dailyPaperLimit: number;
  llmModel: string;
  reviewRules: {
    wrongDays: number;
    lowConfidenceDays: number;
    mediumConfidenceDays: number;
    highConfidenceDays: number;
    masteredDays: number;
  };
  exportSettings: {
    format: "json" | "csv" | "xlsx" | "docx";
    includeExplanations: boolean;
  };
  theme: "neural-lab" | "oceanic-grid" | "classic-dark";
};

export function SettingsForm({ initial }: { initial: SettingsPayload }) {
  const [paperSources, setPaperSources] = useState(initial.paperSources.join(", "));
  const [searchKeywords, setSearchKeywords] = useState(initial.searchKeywords.join(", "));
  const [dailyPaperLimit, setDailyPaperLimit] = useState(String(initial.dailyPaperLimit));
  const [llmModel, setLlmModel] = useState(initial.llmModel);
  const [theme, setTheme] = useState(initial.theme);
  const [format, setFormat] = useState(initial.exportSettings.format);
  const [includeExplanations, setIncludeExplanations] = useState(initial.exportSettings.includeExplanations);
  const [rules, setRules] = useState(initial.reviewRules);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          paperSources: paperSources
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          searchKeywords: searchKeywords
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          dailyPaperLimit: Number(dailyPaperLimit),
          llmModel,
          reviewRules: rules,
          exportSettings: {
            format,
            includeExplanations
          },
          theme
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Save failed: ${JSON.stringify(data.error)}`);
        return;
      }
      setStatus("Settings saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Paper Sources & Keywords</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={paperSources}
            onChange={(event) => setPaperSources(event.target.value)}
            className="min-h-[80px]"
          />
          <Textarea
            value={searchKeywords}
            onChange={(event) => setSearchKeywords(event.target.value)}
            className="min-h-[120px]"
          />
          <Input
            value={dailyPaperLimit}
            onChange={(event) => setDailyPaperLimit(event.target.value)}
            type="number"
            min={1}
            max={100}
          />
          <Input value={llmModel} onChange={(event) => setLlmModel(event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review & Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={1}
              value={rules.wrongDays}
              onChange={(event) => setRules((prev) => ({ ...prev, wrongDays: Number(event.target.value) }))}
              placeholder="Wrong days"
            />
            <Input
              type="number"
              min={1}
              value={rules.lowConfidenceDays}
              onChange={(event) =>
                setRules((prev) => ({ ...prev, lowConfidenceDays: Number(event.target.value) }))
              }
              placeholder="Low confidence days"
            />
            <Input
              type="number"
              min={1}
              value={rules.mediumConfidenceDays}
              onChange={(event) =>
                setRules((prev) => ({ ...prev, mediumConfidenceDays: Number(event.target.value) }))
              }
              placeholder="Medium confidence days"
            />
            <Input
              type="number"
              min={1}
              value={rules.highConfidenceDays}
              onChange={(event) =>
                setRules((prev) => ({ ...prev, highConfidenceDays: Number(event.target.value) }))
              }
              placeholder="High confidence days"
            />
            <Input
              type="number"
              min={1}
              value={rules.masteredDays}
              onChange={(event) => setRules((prev) => ({ ...prev, masteredDays: Number(event.target.value) }))}
              placeholder="Mastered days"
            />
          </div>

          <Select value={format} onChange={(event) => setFormat(event.target.value as typeof format)}>
            <option value="json">json</option>
            <option value="csv">csv</option>
            <option value="xlsx">xlsx</option>
            <option value="docx">docx</option>
          </Select>

          <Select value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
            <option value="neural-lab">neural-lab</option>
            <option value="oceanic-grid">oceanic-grid</option>
            <option value="classic-dark">classic-dark</option>
          </Select>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={includeExplanations}
              onChange={(event) => setIncludeExplanations(event.target.checked)}
            />
            Include explanations in exports
          </label>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
            {status ? <p className="text-xs text-slate-300">{status}</p> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

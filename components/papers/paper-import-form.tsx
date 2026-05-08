"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_ABSTRACT =
  "This paper studies multimodal embodied policy learning and connects representation design with interview-relevant system tradeoffs.";

export function PaperImportForm() {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("Author One, Author Two");
  const [source, setSource] = useState("manual");
  const [sourceUrl, setSourceUrl] = useState("https://arxiv.org/abs/");
  const [pdfUrl, setPdfUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [topicTags, setTopicTags] = useState("VLA, Embodied Intelligence");
  const [oneLineContribution, setOneLineContribution] = useState(
    "Provides actionable design insights for embodied policy training and evaluation."
  );
  const [whyItMatters, setWhyItMatters] = useState(
    "Useful for interview explanations on architecture tradeoffs and failure analysis."
  );
  const [abstract, setAbstract] = useState(DEFAULT_ABSTRACT);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function submit() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          authors: authors
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          abstract,
          source,
          sourceUrl,
          pdfUrl,
          publishedDate,
          topicTags: topicTags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          relevanceScore: 0.62,
          readingPriority: "Skim",
          oneLineContribution,
          whyItMatters
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setStatus(`Import failed: ${JSON.stringify(data.error)}`);
        return;
      }

      const data = await res.json();
      setStatus(`Imported successfully: ${data.paperId}`);
      setTitle("");
    } catch (error) {
      setStatus(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function uploadLocalPdf() {
    if (!pdfFile) return;
    setLoading(true);
    setStatus("");
    try {
      const form = new FormData();
      form.set("file", pdfFile);
      form.set("title", title || pdfFile.name.replace(/\\.pdf$/i, ""));
      form.set("authors", authors);
      form.set("abstract", abstract);
      form.set("topicTags", topicTags);

      const res = await fetch("/api/papers/upload", {
        method: "POST",
        body: form
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(`Upload failed: ${JSON.stringify(data.error)}`);
        return;
      }

      setStatus(`Local PDF imported: ${data.paperId}`);
      setPdfFile(null);
      setTitle("");
    } catch (error) {
      setStatus(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Paper Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Paper title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input
          placeholder="Authors (comma-separated)"
          value={authors}
          onChange={(event) => setAuthors(event.target.value)}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={source} onChange={(event) => setSource(event.target.value)}>
            <option value="manual">manual</option>
            <option value="arxiv">arxiv</option>
            <option value="semantic_scholar">semantic_scholar</option>
            <option value="github">github</option>
            <option value="lab_blog">lab_blog</option>
            <option value="huggingface">huggingface</option>
            <option value="other">other</option>
          </Select>
          <Input
            placeholder="Published date (YYYY-MM-DD)"
            value={publishedDate}
            onChange={(event) => setPublishedDate(event.target.value)}
          />
        </div>
        <Input placeholder="Source URL / arXiv URL / GitHub URL" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
        <Input placeholder="PDF URL (optional)" value={pdfUrl} onChange={(event) => setPdfUrl(event.target.value)} />
        <div className="rounded-xl border border-white/15 bg-white/5 p-3">
          <p className="mb-2 text-xs text-slate-400">Local PDF file import</p>
          <Input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-xs text-slate-500">
            Uploaded files are saved under `data/pdfs/` and processed via the same DB pipeline.
          </p>
        </div>
        <Input placeholder="Topic tags, comma-separated" value={topicTags} onChange={(event) => setTopicTags(event.target.value)} />
        <Textarea placeholder="Abstract" value={abstract} onChange={(event) => setAbstract(event.target.value)} className="min-h-[110px]" />
        <Input
          placeholder="One-line contribution"
          value={oneLineContribution}
          onChange={(event) => setOneLineContribution(event.target.value)}
        />
        <Textarea
          placeholder="Why it matters"
          value={whyItMatters}
          onChange={(event) => setWhyItMatters(event.target.value)}
          className="min-h-[90px]"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={submit} disabled={loading || !title.trim()}>
              {loading ? "Importing..." : "Import URL/Metadata"}
            </Button>
            <Button variant="outline" onClick={uploadLocalPdf} disabled={loading || !pdfFile}>
              Upload Local PDF
            </Button>
          </div>
          {status ? <p className="max-w-[70%] text-xs text-slate-300">{status}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

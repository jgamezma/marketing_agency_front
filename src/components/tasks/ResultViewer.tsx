"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, Minimize2 } from "lucide-react";
import type { ResultAsset } from "@/lib/api";

// ── Markdown renderer ──

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

// ── PDF viewer ──

function PdfViewer({ url, name }: { url: string; name?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{name || "Document"}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" download>
          <Button variant="outline" size="sm">
            <Download className="mr-1 size-3.5" />
            Download
          </Button>
        </a>
      </div>
      <iframe
        src={url}
        className="w-full h-[600px] rounded-lg border"
        title={name || "PDF Document"}
      />
    </div>
  );
}

// ── Video player ──

function VideoPlayer({ url, name }: { url: string; name?: string }) {
  return (
    <div className="space-y-2">
      {name && <p className="text-sm font-medium">{name}</p>}
      <video
        src={url}
        controls
        className="w-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// ── Image viewer ──

function ImageViewer({ url, name }: { url: string; name?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {name && <p className="text-sm font-medium">{name}</p>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <Minimize2 className="mr-1 size-3.5" />
          ) : (
            <Maximize2 className="mr-1 size-3.5" />
          )}
          {expanded ? "Minimize" : "Full size"}
        </Button>
      </div>
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
          onClick={() => setExpanded(false)}
        >
          <img
            src={url}
            alt={name || "Result image"}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
      <img
        src={url}
        alt={name || "Result image"}
        className="w-full rounded-lg cursor-pointer"
        onClick={() => setExpanded(true)}
      />
    </div>
  );
}

// ── Asset renderer (factory) ──

function AssetRenderer({ asset }: { asset: ResultAsset }) {
  switch (asset.type) {
    case "markdown":
      return <MarkdownRenderer content={asset.content ?? ""} />;
    case "pdf":
      return <PdfViewer url={asset.url ?? ""} name={asset.name} />;
    case "video":
      return <VideoPlayer url={asset.url ?? ""} name={asset.name} />;
    case "image":
      return <ImageViewer url={asset.url ?? ""} name={asset.name} />;
    default:
      // Unknown type — show raw JSON
      return (
        <div className="rounded-lg ring-1 ring-foreground/10 p-3">
          <p className="text-xs text-muted-foreground mb-1">
            {asset.type} {asset.name ? `— ${asset.name}` : ""}
          </p>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(asset, null, 2)}
          </pre>
        </div>
      );
  }
}

// ── Main result viewer ──

interface ResultViewerProps {
  resultMarkdown: string | null;
  resultAssets: ResultAsset[] | null;
}

export function ResultViewer({ resultMarkdown, resultAssets }: ResultViewerProps) {
  const assets = Array.isArray(resultAssets) ? resultAssets : [];

  return (
    <div className="space-y-4">
      {resultMarkdown && (
        <div className="rounded-lg bg-muted p-4">
          <MarkdownRenderer content={resultMarkdown} />
        </div>
      )}
      {assets.length > 0 && (
        <div className="space-y-4">
          {!resultMarkdown && (
            <p className="text-sm font-medium">Deliverables</p>
          )}
          {assets.map((asset, i) => (
            <AssetRenderer key={i} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}

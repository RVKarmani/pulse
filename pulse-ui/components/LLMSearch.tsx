"use client";

import { useState } from "react";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Accordion } from "@/components/retroui/Accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/retroui";
import { Brain, Bot, MessageCircle } from "lucide-react";

export default function LLMSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ primary_key: number; distance: number; content: string }[]>([]);
  const [thinkingContent, setThinkingContent] = useState("");
  const [responseContent, setResponseContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"thinking" | "response">("thinking");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setThinkingContent("");
    setResponseContent("");
    setActiveTab("thinking");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PULSE_API_HOST}/llm/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.body) {
        throw new Error("ReadableStream not supported in this environment.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            setLoading(false);

            switch (parsed.stage) {
              case "results":
                setResults(parsed.content);
                break;

              case "thinking":
                setThinkingContent((prev) => prev + parsed.content);
                break;

              case "response":
                setActiveTab("response");
                setResponseContent((prev) => prev + parsed.content);
                break;

              case "error":
                console.error("Stream error:", parsed.content);
                break;
            }
          } catch (e) {
            console.error("JSON parse error:", e);
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Input with button */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="ask pulse something..."
          className="flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <Button size="icon" onClick={handleSearch} disabled={loading}>
          <Brain className="w-5 h-5" />
        </Button>
      </div>

      {/* Toggle between RAG responses */}
      {(thinkingContent || responseContent) && (
        <ToggleGroup
          type="single"
          variant="outlined"
          value={activeTab}
          onValueChange={(value) => {
            if (value) setActiveTab(value as "thinking" | "response");
          }}
          className="mb-2"
        >
          <ToggleGroupItem value="thinking">
            <Bot className="w-4 h-4 mr-1" />
            Thinking
          </ToggleGroupItem>
          <ToggleGroupItem value="response">
            <MessageCircle className="w-4 h-4 mr-1" />
            Summary
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      {/* Conditionally show RAG cards */}
      {activeTab === "thinking" && thinkingContent && (
        <Card className="max-h-64 overflow-y-auto">
          <Card.Content className="whitespace-pre-line">{thinkingContent}</Card.Content>
        </Card>
      )}

      {activeTab === "response" && responseContent && (
        <Card>
          <Card.Content className="whitespace-pre-line">{responseContent}</Card.Content>
        </Card>
      )}

      {/* Loading indicator */}
      {loading && results.length === 0 && (
        <Card>
          <Card.Content className="text-muted">Searching...</Card.Content>
        </Card>
      )}

      {/* Vector Search Results */}
      {results.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title className="text-base font-semibold">Top Search Results</Card.Title>
          </Card.Header>
          <Card.Content>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {results.map((result, idx) => {
                const [title, ...rest] = result.content.split("\n");
                const description = rest.join("\n").trim();
                return (
                  <Accordion.Item key={idx} value={`item-${idx}`}>
                    <Accordion.Header>
                      {title || `Result #${idx + 1}`}
                    </Accordion.Header>
                    <Accordion.Content>
                      <p className="text-sm whitespace-pre-line">{description}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Distance: {result.distance.toFixed(4)} | ID: {result.primary_key}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card.Content>
        </Card>
      )}
    </div>
  );
}

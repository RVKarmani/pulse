"use client";

import { useState } from "react";
import { Input } from "@/components/retroui/Input";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Brain } from "lucide-react";

export default function LLMSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ content: string }[]>([]);
  const [ragResponse, setRagResponse] = useState<string>(""); // New state for rag_response
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setRagResponse(""); // Clear previous rag response

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PULSE_API_HOST}/llm/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setRagResponse(data.rag_response || ""); // Set the rag_response here
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
        />
        <Button size="icon" onClick={handleSearch} disabled={loading}>
          <Brain className="w-5 h-5" />
        </Button>
      </div>

      {/* RAG Response card below input */}
      {ragResponse && (
        <Card>
          <Card.Header>
            <Card.Title className="text-base font-semibold">RAG Response</Card.Title>
          </Card.Header>
          <Card.Content className="whitespace-pre-line">{ragResponse}</Card.Content>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result, idx) => {
          const [title, ...rest] = result.content.split("\n");
          const description = rest.join("\n").trim();

          return (
            <Card key={idx}>
              <Card.Header>
                <Card.Title className="text-base font-semibold">{title}</Card.Title>
                {description && (
                  <Card.Description className="text-sm whitespace-pre-line">
                    {description}
                  </Card.Description>
                )}
              </Card.Header>
            </Card>
          );
        })}

        {loading && (
          <Card>
            <Card.Content className="text-muted">Searching...</Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}

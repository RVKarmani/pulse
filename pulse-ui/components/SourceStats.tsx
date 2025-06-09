"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/retroui/Card";

type SourceStat = {
  source_shortcode: string;
  source_name: string;
  item_count: number;
};

export default function SourceStats() {
  const [sources, setSources] = useState<SourceStat[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStream = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_PULSE_API_HOST}/api/sourcestats`, {
        method: "GET",
        signal: controller.signal,
        // Avoid ngrok warning
        headers: {
          "ngrok-skip-browser-warning": "true" 
        }
      });


      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          try {
            const data: SourceStat = JSON.parse(line.trim());
            setSources((prev) => {
              const existingIndex = prev.findIndex(
                (s) => s.source_shortcode === data.source_shortcode
              );
              if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = data;
                return updated;
              }
              return [...prev, data];
            });
          } catch (e) {
            console.error("Failed to parse stream line:", line);
          }
        }
      }
    };

    fetchStream().catch(console.error);

    return () => controller.abort();
  }, []);

  return (
    <>
      {sources.map((source) => (
        <Card
          key={source.source_shortcode}
          className="w-full bg-background shadow-none"
        >
          <Card.Header>
            <Card.Title>{source.source_name}</Card.Title>
            <Card.Description>
              Articles processed: {source.item_count}
            </Card.Description>
          </Card.Header>
        </Card>
      ))}
    </>
  );

}

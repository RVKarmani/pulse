"use client";

import React, { useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';

type NodeType = { id: string, group: string };
type LinkType = { source: string; target: string };

const KnowledgeGraph = () => {
    const [data, setData] = useState<{ nodes: NodeType[]; links: LinkType[] }>({
        nodes: [],
        links: []
    });

    useEffect(() => {
        const streamJSONL = async <T,>(
            url: string,
            onData: (parsed: T) => void
        ) => {
            const res = await fetch(url, {
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            });
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const parsed = JSON.parse(line);
                            onData(parsed);
                        } catch (err) {
                            console.error("Invalid JSONL line:", line, err);
                        }
                    }
                }
            }

            // handle any remaining data
            if (buffer.trim()) {
                try {
                    const parsed = JSON.parse(buffer);
                    onData(parsed);
                } catch (err) {
                    console.error("Final JSONL parse failed:", buffer, err);
                }
            }
        };

        streamJSONL<any>(`${process.env.NEXT_PUBLIC_PULSE_API_HOST}/api/graph`, (item) => {
            setData((prev) => {
                if ("id" in item && "node_type" in item) {
                    // It's a node
                    return {
                        nodes: [...prev.nodes, { id: item.id, group: item.node_type }],
                        links: prev.links,
                    };
                } else if ("source" in item && "target" in item) {
                    // It's a relationship/link
                    return {
                        nodes: prev.nodes,
                        links: [...prev.links, { source: item.source, target: item.target }],
                    };
                } else {
                    console.warn("Unknown item type received:", item);
                    return prev; // ignore unknown objects
                }
            });
        });
    }, []);

    return (
        <ForceGraph3D
            enableNodeDrag={false}
            graphData={data}
            nodeAutoColorBy="group"
            nodeThreeObject={(node: { id: string | undefined; color: string; }) => {
                const sprite = new SpriteText(node.id);
                sprite.color = node.color;
                sprite.textHeight = 8;
                return sprite;
            }}
        />
    );
};

export default KnowledgeGraph;

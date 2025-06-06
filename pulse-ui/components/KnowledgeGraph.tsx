"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

type NodeType = { id: number };
type LinkType = { source: number; target: number };

const KnowledgeGraph = () => {
    const [data, setData] = useState<{ nodes: NodeType[]; links: LinkType[] }>({
        nodes: [{ id: 0 }],
        links: []
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prevData => {
                const newId = prevData.nodes.length > 0
                    ? Math.max(...prevData.nodes.map(n => n.id)) + 1
                    : 0;
                const targetId = prevData.nodes[Math.floor(Math.random() * prevData.nodes.length)].id;

                return {
                    nodes: [...prevData.nodes, { id: newId }],
                    links: [...prevData.links, { source: newId, target: targetId }]
                };
            });
        }, 1000);

        return () => clearInterval(interval); // cleanup
    }, []);

    const handleClick = useCallback((node: NodeType) => {
        setData(prevData => {
            const newNodes = prevData.nodes.filter(n => n.id !== node.id);
            const newLinks = prevData.links.filter(
                l => l.source !== node.id && l.target !== node.id
            );
            return { nodes: newNodes, links: newLinks };
        });
    }, []);

    return (
        <ForceGraph3D
            enableNodeDrag={false}
            onNodeClick={handleClick}
            graphData={data}
        />
    );
};

export default KnowledgeGraph;

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';
import React, { useCallback, useState, useMemo } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerNode, FilterNode, AiNode } from './flow-nodes';


const initialNodes: Node[] = [
  {
    id: 'trigger',
    type: 'triggerNode',
    position: { x: 100, y: 150 },
    data: {
      label: 'Tweet Detection',
    }
  },
  {
    id: 'filter',
    type: 'filterNode',
    position: { x: 400, y: 150 },
    data: {
      label: 'Content Filter',
    }
  },
  {
    id: 'ai-response',
    type: 'aiNode',
    position: { x: 700, y: 150 },
    data: {
      label: 'AI Response Generator',
    }
  }
];

const initialEdges: Edge[] = [
    { id: 'trigger-filter', source: 'trigger', target: 'filter', animated: true, type: 'smoothstep' },
    { id: 'filter-ai-response', source: 'filter', target: 'ai-response', animated: true, type: 'smoothstep' },
];

export function VisualEditor() {
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const nodeTypes: NodeTypes = useMemo(() => ({
        triggerNode: TriggerNode,
        filterNode: FilterNode,
        aiNode: AiNode,
    }), []);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
      );
    
      const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
      );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-lg">Flow Editor</CardTitle>
        </div>
        <CardDescription>
          Visualize and manage your agent's workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full rounded-lg border">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background gap={16} size={1} />
            </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}

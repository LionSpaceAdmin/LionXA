"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, PlusCircle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';


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

let id = 4;
const getNextId = () => `node_${id++}`;

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

    const onAddNode = useCallback((type: 'filterNode' | 'aiNode') => {
      const newNode: Node = {
        id: getNextId(),
        type,
        position: {
          x: Math.random() * 500,
          y: Math.random() * 300,
        },
        data: { label: `New ${type === 'filterNode' ? 'Filter' : 'AI'} Node` },
      };
      setNodes((nds) => nds.concat(newNode));
    }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-lg">Flow Editor</CardTitle>
        </div>
        <CardDescription>
          Visualize and manage your agent's workflow. Drag to connect nodes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddNode('filterNode')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Filter
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddNode('aiNode')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add AI Step
            </Button>
        </div>
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

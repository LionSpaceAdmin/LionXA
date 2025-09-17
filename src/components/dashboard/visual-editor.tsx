"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, PlusCircle } from 'lucide-react';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type NodeTypes,
  type Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TriggerNode, FilterNode, AiNode } from './flow-nodes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

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

    const onConnect = useCallback(
      (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true, type: 'smoothstep' }, eds)),
      [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);
    
    useEffect(() => {
        if (selectedNode) {
            setNodes((nds) =>
            nds.map((node) => {
                    if (node.id === selectedNode.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: selectedNode.data.label,
                            },
                        };
                    }
                    return node;
                })
            );
        }
    }, [selectedNode, setNodes]);

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
          Visualize your agent's workflow. Click a node to edit it, or select and press Backspace to delete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="col-span-1 md:col-span-2">
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
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        deleteKeyCode={['Backspace', 'Delete']}
                    >
                        <Controls />
                        <MiniMap nodeStrokeWidth={3} zoomable pannable />
                        <Background gap={16} size={1} />
                    </ReactFlow>
                </div>
            </div>
            <div className="col-span-1">
                {selectedNode ? (
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="font-headline text-md mb-4 font-semibold">Edit Node</h3>
                         <div className="space-y-2">
                            <Label htmlFor="node-label">Label</Label>
                            <Input
                                id="node-label"
                                value={selectedNode.data.label}
                                onChange={(e) => setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: e.target.value }})}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setSelectedNode(null)}>Done</Button>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">Click a node to edit</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

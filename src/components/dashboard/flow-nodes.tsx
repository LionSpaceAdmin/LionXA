import { Handle, Position, type NodeProps } from 'reactflow';
import { Twitter, ListFilter, Bot } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function CustomNodeWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("w-64 rounded-lg border-2 bg-card shadow-md hover:shadow-lg transition-shadow", className)}>
      {children}
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </Card>
  );
}

export function TriggerNode({ data }: NodeProps) {
  return (
    <CustomNodeWrapper className="border-blue-500/80">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <Twitter className="h-6 w-6 text-blue-500" />
        </div>
        <CardTitle className="text-base font-medium">{data.label}</CardTitle>
      </CardHeader>
    </CustomNodeWrapper>
  );
}

export function FilterNode({ data }: NodeProps) {
  return (
    <CustomNodeWrapper className="border-yellow-500/80">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
                <ListFilter className="h-6 w-6 text-yellow-500" />
            </div>
            <CardTitle className="text-base font-medium">{data.label}</CardTitle>
        </CardHeader>
    </CustomNodeWrapper>
  );
}

export function AiNode({ data }: NodeProps) {
  return (
    <CustomNodeWrapper className="border-green-500/80">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
                <Bot className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-base font-medium">{data.label}</CardTitle>
        </CardHeader>
    </CustomNodeWrapper>
  );
}

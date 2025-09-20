import React, { useState, useEffect } from 'react';

// --- Type Definitions ---
type NodeStatus = 'synced' | 'modified' | 'new';

interface ProjectNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  status: NodeStatus;
  children?: ProjectNode[];
}

interface LiveProjectTreeProps {
  treeData: ProjectNode[];
}

// --- SVG Icons ---
const getIcon = (type: 'file' | 'directory', name: string, isOpen: boolean) => {
  if (type === 'directory') {
    return isOpen ? (
      <svg viewBox="0 0 16 16" fill="#58a6ff" width="16" height="16"><path d="M.02 2.5A2.5 2.5 0 0 1 2.5 0h2.955a1.5 1.5 0 0 1 1.06.44L8.44 2.366A.5.5 0 0 0 8.793 2.5H13.5A2.5 2.5 0 0 1 16 5v5.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 .02 10.5v-8Z"></path></svg>
    ) : (
      <svg viewBox="0 0 16 16" fill="#58a6ff" width="16" height="16"><path d="M.5 4.5A2.5 2.5 0 0 1 3 2h2.955a1.5 1.5 0 0 1 1.06.44L8.94 4.366A.5.5 0 0 0 9.293 4.5H13a2 2 0 0 1 2 2v3.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5.5a.5.5 0 0 0-.5-.5Z"></path></svg>
    );
  }
  const ext = name.split('.').pop();
  switch (ext) {
    case 'tsx': return <svg viewBox="0 0 16 16" fill="#61DAFB" width="16" height="16"><path d="M7.64 1.13A.5.5 0 0 1 8.36 1.13l7.35 12.73a.5.5 0 0 1-.43.74H.72a.5.5 0 0 1-.43-.74Z M8 12.23a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0-3.32a.91.91 0 0 0-.9.99v.05a.9.9 0 0 0 1.8 0v-.05a.91.91 0 0 0-.9-.99"></path></svg>;
    case 'json': return <svg viewBox="0 0 16 16" fill="#F7DF1E" width="16" height="16"><path d="M5.03 14.22a.75.75 0 0 1 0-1.06L9.44 8.75H1.75a.75.75 0 0 1 0-1.5h7.69L5.03 2.84a.75.75 0 0 1 1.06-1.06l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06 0"></path></svg>;
    case 'md': return <svg viewBox="0 0 16 16" fill="#c9d1d9" width="16" height="16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v11A2.5 2.5 0 0 1 11.5 16h-7A2.5 2.5 0 0 1 2 13.5ZM4.5 1h7a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 13.5v-11A1.5 1.5 0 0 1 4.5 1Z"></path><path d="M5.5 5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1Zm0 3a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1Zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1Z"></path></svg>;
    case 'html': return <svg viewBox="0 0 16 16" fill="#E34F26" width="16" height="16"><path d="m8.52 1.13-6.35 1.27L3.1 14.26l4.9 1.61 4.9-1.61 1.07-11.86ZM6.5 12.11 4.67 11.6l-.33-3.66h2.24l-.08.92H5.08l.1 1.16 1.32.4Zm2.9-.88-1.78-.6v-1.8h3.6l-.08.92-2.62.04.08-.92h2.54l.33-3.66H6.42l.33-3.67h5.9L13.5 3Z"></path></svg>;
    default: return <svg viewBox="0 0 16 16" fill="#8b949e" width="16" height="16"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586a1.75 1.75 0 0 1 1.237.513l2.914 2.914A1.75 1.75 0 0 1 15 4.414V14.25c0 .966-.784 1.75-1.75 1.75H3.75A1.75 1.75 0 0 1 2 14.25ZM3.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.414a.25.25 0 0 0-.073-.177L11.013 1.573A.25.25 0 0 0 10.836 1.5Z"></path></svg>;
  }
};

const getStatusColor = (status: NodeStatus) => {
  switch (status) {
    case 'synced': return '#3fb950';
    case 'modified': return '#ffb703';
    case 'new': return '#58a6ff';
    default: return '#8b949e';
  }
};

// --- Styles ---
const treeStyles = `
.live-tree-container {
    background-color: #0d1117;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", sans-serif;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.tree-header {
    padding: 5px 10px;
    border-bottom: 1px solid #30363d;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.tree-header h3 { margin: 0; font-size: 1.1em; }
.last-synced { font-size: 0.8em; color: #8b949e; }
.tree-viewport { overflow-y: auto; flex-grow: 1; }
.tree-node {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    cursor: pointer;
    border-radius: 4px;
}
.tree-node:hover { background-color: #161b22; }
.node-content { display: flex; align-items: center; gap: 8px; }
.node-icon { line-height: 0; }
.node-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: auto;
    margin-right: 8px;
}
`;

const TreeStyles = () => <style>{treeStyles}</style>;

// --- Recursive TreeNode Component ---
const TreeNode: React.FC<{ node: ProjectNode; level: number }> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isDirectory = node.type === 'directory';
  const handleToggle = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div className="tree-node" style={{ paddingLeft: `${level * 20 + 10}px` }} onClick={handleToggle}>
        <div className="node-content">
          <span className="node-icon">{getIcon(node.type, node.name, isOpen)}</span>
          <span>{node.name}</span>
        </div>
        <div className="node-status" style={{ backgroundColor: getStatusColor(node.status) }}></div>
      </div>
      {isOpen && isDirectory && node.children && (
        <div className="node-children">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const LiveProjectTree: React.FC<LiveProjectTreeProps> = ({ treeData }) => {
    const [lastSynced, setLastSynced] = useState(new Date());

    useEffect(() => {
        setLastSynced(new Date());
    }, [treeData]);

    return (
        <>
            <TreeStyles />
            <div className="live-tree-container">
                <div className="tree-header">
                    <h3>Live Project Structure</h3>
                    <span className="last-synced">Last Synced: {lastSynced.toLocaleTimeString()}</span>
                </div>
                <div className="tree-viewport">
                    {treeData.map(node => (
                        <TreeNode key={node.id} node={node} level={0} />
                    ))}
                </div>
            </div>
        </>
    );
};

export default LiveProjectTree;

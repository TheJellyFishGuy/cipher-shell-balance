import React, { useState } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  color: string;
}

interface WorkspaceManagerProps {
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
  workspaces: Workspace[];
  onAddWorkspace: () => void;
  onDeleteWorkspace: (id: string) => void;
  onRenameWorkspace: (id: string, name: string) => void;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  activeWorkspace,
  onWorkspaceChange,
  workspaces,
  onAddWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (workspace: Workspace) => {
    setEditingId(workspace.id);
    setEditName(workspace.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameWorkspace(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditName('');
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 glass-panel">
      <div className="flex items-center gap-1 overflow-x-auto">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`workspace-tab group relative ${
              activeWorkspace === workspace.id ? 'active' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: workspace.color }}
              />
              
              {editingId === workspace.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent border-none outline-none text-sm min-w-0 flex-1"
                  autoFocus
                />
              ) : (
                <span
                  className="text-sm font-medium cursor-pointer truncate"
                  onClick={() => onWorkspaceChange(workspace.id)}
                >
                  {workspace.name}
                </span>
              )}
            </div>

            {/* Workspace controls */}
            <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleStartEdit(workspace)}
                className="w-5 h-5 glass-panel flex items-center justify-center text-xs"
              >
                <Edit2 className="w-2 h-2" />
              </button>
              {workspaces.length > 1 && (
                <button
                  onClick={() => onDeleteWorkspace(workspace.id)}
                  className="w-5 h-5 glass-panel flex items-center justify-center text-xs hover:text-red-400"
                >
                  <X className="w-2 h-2" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAddWorkspace}
        className="glass-button flex items-center gap-2 text-sm whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        New Workspace
      </button>
    </div>
  );
};
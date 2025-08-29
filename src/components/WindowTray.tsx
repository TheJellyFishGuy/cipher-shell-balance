import React from 'react';
import { 
  Terminal, 
  MessageCircle, 
  Image, 
  FileText, 
  Monitor, 
  Settings,
  Activity,
  Folder,
  Calculator,
  Clock
} from 'lucide-react';

interface TrayItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  count?: number;
}

interface WindowTrayProps {
  items: TrayItem[];
  onItemClick: (id: string) => void;
  onItemToggle: (id: string) => void;
}

export const WindowTray: React.FC<WindowTrayProps> = ({
  items,
  onItemClick,
  onItemToggle,
}) => {
  const quickActions = [
    { id: 'calculator', name: 'Calculator', icon: Calculator },
    { id: 'clock', name: 'Clock', icon: Clock },
    { id: 'system', name: 'System Monitor', icon: Activity },
    { id: 'files', name: 'File Explorer', icon: Folder },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="glass-panel p-2 flex flex-col gap-2">
        {/* Main application windows */}
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`tray-item relative ${item.isActive ? 'active' : ''}`}
                onClick={() => onItemToggle(item.id)}
                title={item.name}
              >
                <Icon className="w-5 h-5" />
                {item.count && item.count > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {item.count > 9 ? '9+' : item.count}
                  </div>
                )}
                
                {/* Active indicator */}
                {item.isActive && (
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-px bg-white/10 my-2" />

        {/* Quick action buttons */}
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="tray-item"
                onClick={() => onItemClick(action.id)}
                title={action.name}
              >
                <Icon className="w-5 h-5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
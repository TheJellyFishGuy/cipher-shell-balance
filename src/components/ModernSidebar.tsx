import React from 'react';
import { 
  Terminal, 
  Shield, 
  Users, 
  Mail, 
  HelpCircle, 
  Settings,
  LogOut,
  User,
  FileText
} from 'lucide-react';
import { UserService } from '@/services/UserService';

interface ModernSidebarProps {
  onCommand: (command: string) => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({ onCommand }) => {
  const currentUser = UserService.getCurrentUser();

  const quickActions = [
    { icon: Shield, label: 'Encrypt File', command: 'encrypt', color: 'text-emerald-600' },
    { icon: FileText, label: 'Decrypt File', command: 'decrypt', color: 'text-purple-600' },
    { icon: Mail, label: 'Check Mail', command: 'mail', color: 'text-blue-600' },
    { icon: HelpCircle, label: 'Help', command: 'help', color: 'text-amber-600' },
  ];

  const userActions = [
    { icon: User, label: 'Register User', command: 'registeruser', color: 'text-indigo-600' },
    { icon: Users, label: 'Start Chat', command: 'chat', color: 'text-cyan-600' },
    { icon: Terminal, label: 'Clear Terminal', command: 'clear', color: 'text-gray-600' },
  ];

  return (
    <div className="card-modern h-full animate-slide-up">
      <div className="space-y-6">
        {/* User Info */}
        {currentUser ? (
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">@{currentUser.username}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Logged in</p>
              </div>
            </div>
            <button
              onClick={() => onCommand('logout')}
              className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-2">Not logged in</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              Sign in to access chat and secure messaging
            </p>
            <div className="space-y-2">
              <button
                onClick={() => onCommand('registeruser')}
                className="w-full text-xs bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 py-2 rounded-md transition-colors"
              >
                Register Account
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">File Operations</h4>
          <div className="space-y-2">
            {quickActions.map(({ icon: Icon, label, command, color }) => (
              <button
                key={command}
                onClick={() => onCommand(command)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-left group"
              >
                <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Actions */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 text-sm">User Actions</h4>
          <div className="space-y-2">
            {userActions.map(({ icon: Icon, label, command, color }) => (
              <button
                key={command}
                onClick={() => onCommand(command)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-left group"
              >
                <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-medium text-blue-700 dark:text-blue-300 text-sm mb-2">💡 Quick Tips</h5>
          <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
            <p>• Use <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">login username password</code> to sign in</p>
            <p>• Chat with users using <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">chat username</code></p>
            <p>• Upload files by dragging them to the upload area</p>
          </div>
        </div>
      </div>
    </div>
  );
};
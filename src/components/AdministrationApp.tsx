import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, Settings, Key, FileText, AlertTriangle } from 'lucide-react';
import { UserService } from '@/services/UserService';
import { MessageService } from '@/services/MessageService';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
}

interface SystemStats {
  totalUsers: number;
  totalMessages: number;
  systemUptime: string;
  encryptionStatus: string;
}

export const AdministrationApp: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    totalMessages: 0,
    systemUptime: '0h 0m',
    encryptionStatus: 'Active'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // For now, we'll simulate the data
      
      // Simulate user data
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@balance.com',
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          username: 'demo_user',
          email: 'demo@balance.com',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setUsers(mockUsers);
      setSystemStats({
        totalUsers: mockUsers.length,
        totalMessages: 42, // Simulated
        systemUptime: '2h 15m',
        encryptionStatus: 'Active (Balance & Causality)'
      });

      toast({
        title: "System Data Loaded",
        description: "Administration dashboard updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Failed to load system data.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleUserAction = (userId: string, action: string) => {
    toast({
      title: `User ${action}`,
      description: `User action "${action}" would be performed on user ${userId}`,
    });
  };

  const handleSystemAction = (action: string) => {
    toast({
      title: "System Action",
      description: `System action "${action}" would be performed`,
    });
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Database },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Settings },
  ];

  return (
    <div className="h-full p-6">
      <div className="neomorphic-panel p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="neomorphic-button p-3">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Administration</h1>
              <p className="text-sm text-muted-foreground">Developer Mode • System Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">DEV MODE</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`neomorphic-button px-4 py-2 flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'neomorphic-inset' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="neomorphic-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{systemStats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                <div className="neomorphic-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Messages</p>
                      <p className="text-2xl font-bold">{systemStats.totalMessages}</p>
                    </div>
                    <FileText className="w-8 h-8 text-accent" />
                  </div>
                </div>
                
                <div className="neomorphic-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">System Uptime</p>
                      <p className="text-2xl font-bold">{systemStats.systemUptime}</p>
                    </div>
                    <Database className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                
                <div className="neomorphic-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Encryption</p>
                      <p className="text-lg font-bold text-green-600">{systemStats.encryptionStatus}</p>
                    </div>
                    <Key className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="neomorphic-panel p-4">
                <h3 className="text-lg font-semibold mb-3">Recent System Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>System started</span>
                    <span className="text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User 'demo_user' logged in</span>
                    <span className="text-muted-foreground">1 hour ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New message encrypted</span>
                    <span className="text-muted-foreground">30 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Management</h2>
                <button
                  onClick={loadSystemData}
                  disabled={isLoading}
                  className="neomorphic-button px-4 py-2 text-primary"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              <div className="neomorphic-panel p-4">
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="neomorphic-inset p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'View Details')}
                          className="neomorphic-button px-3 py-1 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'Reset Password')}
                          className="neomorphic-button px-3 py-1 text-sm text-destructive"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Security Management</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="neomorphic-panel p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Encryption Formats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Balance Format (.balance)</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Causality Format (.causality)</span>
                      <span className="text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSystemAction('Rotate Encryption Keys')}
                    className="neomorphic-button px-4 py-2 mt-4 text-sm w-full"
                  >
                    Rotate Keys
                  </button>
                </div>

                <div className="neomorphic-panel p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleSystemAction('Export Security Logs')}
                      className="neomorphic-button px-4 py-2 text-sm w-full"
                    >
                      Export Security Logs
                    </button>
                    <button
                      onClick={() => handleSystemAction('Force Logout All Users')}
                      className="neomorphic-button px-4 py-2 text-sm w-full text-destructive"
                    >
                      Force Logout All
                    </button>
                    <button
                      onClick={() => handleSystemAction('Clear All Sessions')}
                      className="neomorphic-button px-4 py-2 text-sm w-full text-destructive"
                    >
                      Clear Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">System Management</h2>
              
              <div className="neomorphic-panel p-4">
                <h3 className="font-semibold mb-4">System Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSystemAction('Backup Database')}
                    className="neomorphic-button p-4 text-center"
                  >
                    <Database className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Backup Database</span>
                  </button>
                  <button
                    onClick={() => handleSystemAction('Clear Cache')}
                    className="neomorphic-button p-4 text-center"
                  >
                    <Settings className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Clear Cache</span>
                  </button>
                  <button
                    onClick={() => handleSystemAction('Generate Report')}
                    className="neomorphic-button p-4 text-center"
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </button>
                  <button
                    onClick={() => handleSystemAction('Restart System')}
                    className="neomorphic-button p-4 text-center text-destructive"
                  >
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Restart System</span>
                  </button>
                </div>
              </div>

              <div className="neomorphic-panel p-4">
                <h3 className="font-semibold mb-3">System Information</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>Balance v2.0.0-dev</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="text-destructive">Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <span className="text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <span>45.2 MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Battery, Activity, Clock } from 'lucide-react';

interface SystemStats {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  battery?: number;
  uptime: string;
}

export const SystemMonitor: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    storage: 0,
    network: 0,
    uptime: '0h 0m',
  });

  useEffect(() => {
    const updateStats = () => {
      // Simulate system stats (in real app, these would come from actual system APIs)
      setStats({
        cpu: Math.random() * 100,
        memory: 45 + Math.random() * 30,
        storage: 65 + Math.random() * 20,
        network: Math.random() * 100,
        battery: 'getBattery' in navigator ? undefined : 85 + Math.random() * 15,
        uptime: `${Math.floor(Date.now() / 3600000)}h ${Math.floor((Date.now() % 3600000) / 60000)}m`,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    // Try to get real battery info
    if ('getBattery' in navigator) {
      ((navigator as any).getBattery as () => Promise<any>)().then((battery: any) => {
        const updateBattery = () => {
          setStats(prev => ({
            ...prev,
            battery: Math.round(battery.level * 100),
          }));
        };
        
        battery.addEventListener('levelchange', updateBattery);
        updateBattery();
      });
    }

    return () => clearInterval(interval);
  }, []);

  const StatCard: React.FC<{
    icon: React.ComponentType<any>;
    title: string;
    value: number;
    unit: string;
    color: string;
  }> = ({ icon: Icon, title, value, unit, color }) => (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{Math.round(value)}{unit}</span>
      </div>
      
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
            value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">System Monitor</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={Cpu}
          title="CPU Usage"
          value={stats.cpu}
          unit="%"
          color="text-blue-500"
        />
        
        <StatCard
          icon={HardDrive}
          title="Memory"
          value={stats.memory}
          unit="%"
          color="text-green-500"
        />
        
        <StatCard
          icon={HardDrive}
          title="Storage"
          value={stats.storage}
          unit="%"
          color="text-purple-500"
        />
        
        <StatCard
          icon={Wifi}
          title="Network"
          value={stats.network}
          unit="%"
          color="text-cyan-500"
        />

        {stats.battery !== undefined && (
          <StatCard
            icon={Battery}
            title="Battery"
            value={stats.battery}
            unit="%"
            color="text-orange-500"
          />
        )}
      </div>

      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">System Information</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uptime:</span>
            <span>{stats.uptime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform:</span>
            <span>{navigator.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User Agent:</span>
            <span className="truncate max-w-48">{navigator.userAgent.split(' ')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Language:</span>
            <span>{navigator.language}</span>
          </div>
        </div>
      </div>

      {/* Real-time chart placeholder */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-3">Performance History</h3>
        <div className="h-32 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Live chart would go here</span>
        </div>
      </div>
    </div>
  );
};
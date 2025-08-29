import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const ModernHeader: React.FC = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-brand">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] bg-clip-text text-transparent">
                Balance
              </h1>
              <p className="text-xs text-muted-foreground">Secure File Management</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            v2.0.0 Enterprise
          </div>
        </div>
      </div>
    </header>
  );
};
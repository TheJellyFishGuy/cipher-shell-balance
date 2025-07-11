
import React from 'react';

export const BalanceLogo: React.FC = () => {
  return (
    <div className="text-white font-mono text-xs leading-none whitespace-pre text-left flex flex-col pl-2">
{`
██████╗  █████╗ ██╗      █████╗ ███╗   ██╗ ██████╗███████╗
██╔══██╗██╔══██╗██║     ██╔══██╗████╗  ██║██╔════╝██╔════╝
██████╔╝███████║██║     ███████║██╔██╗ ██║██║     █████╗  
██╔══██╗██╔══██║██║     ██╔══██║██║╚██╗██║██║     ██╔══╝  
██████╔╝██║  ██║███████╗██║  ██║██║ ╚████║╚██████╗███████╗
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝
`}
      <div className="text-left mt-2 text-xs text-white opacity-80 pl-0">
        v1.3.7
      </div>
    </div>
  );
};

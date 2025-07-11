
import React from 'react';

export const BalanceLogo: React.FC = () => {
  return (
    <div className="text-white font-mono text-xs leading-none whitespace-pre text-left flex flex-col" style={{ marginLeft: '-25px' }}>
{`
██████╗  █████╗ ██╗      █████╗ ███╗   ██╗ ██████╗███████╗
██╔══██╗██╔══██╗██║     ██╔══██╗████╗  ██║██╔════╝██╔════╝
██████╔╝███████║██║     ███████║██╔██╗ ██║██║     █████╗  
██╔══██╗██╔══██║██║     ██╔══██║██║╚██╗██║██║     ██╔══╝  
██████╔╝██║  ██║███████╗██║  ██║██║ ╚████║╚██████╗███████╗
╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝
`}
      <div className="text-center mt-2 text-xs text-white opacity-80" style={{ marginLeft: '25px' }}>
        v1.3.7
      </div>
    </div>
  );
};

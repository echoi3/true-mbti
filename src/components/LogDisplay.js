import React from 'react';

const LogDisplay = ({ logs }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4 max-h-48 overflow-y-auto">
      <h3 className="text-lg font-bold mb-2">Debug Logs:</h3>
      {logs.map((log, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
        </div>
      ))}
    </div>
  );
};

export default LogDisplay;
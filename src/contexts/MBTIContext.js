import React, { createContext, useContext, useState } from 'react';

const MBTIContext = createContext();

export const useMBTIContext = () => useContext(MBTIContext);

export const MBTIProvider = ({ children }) => {
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const triggerRefetch = () => {
    setShouldRefetch(prev => !prev);
  };

  return (
    <MBTIContext.Provider value={{ shouldRefetch, triggerRefetch }}>
      {children}
    </MBTIContext.Provider>
  );
};
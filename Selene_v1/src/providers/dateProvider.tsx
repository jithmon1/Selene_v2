import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Create the context
const DateContext = createContext<Date | undefined>(undefined);

// Create the provider component
export const DateProvider = ({ children }: { children: ReactNode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update the current date and time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <DateContext.Provider value={currentDate}>
      {children}
    </DateContext.Provider>
  );
};

export default DateContext;
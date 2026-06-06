"use client";

import React, { createContext, useContext } from 'react';

interface HomeData {
  latestArticles: any[];
  financeArticles: any[];
  legalArticles: any[];
  hindiArticles: any[];
  judgmentsArticles?: any[];
}


const HomeDataContext = createContext<HomeData | null>(null);

export const HomeDataProvider = ({ children, data }: { children: React.ReactNode; data: HomeData }) => {
  return (
    <HomeDataContext.Provider value={data}>
      {children}
    </HomeDataContext.Provider>
  );
};

export const useHomeData = () => {
  return useContext(HomeDataContext);
};

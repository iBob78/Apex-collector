"use client";

import React, { useEffect } from 'react';
import axe from '@axe-core/react';

const AxeClient = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      setTimeout(() => {
        axe(React, document, 1000).then((results) => {
          console.log('🚨 Résultats accessibilité axe-core:', results);
        });
      }, 500);
    }
  }, []);

  return null;
};

export default AxeClient;

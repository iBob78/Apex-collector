"use client";

import React from 'react';

const LazyImage = () => {
  return (
    <img
      src="https://via.placeholder.com/400"
      alt="Image chargée dynamiquement"
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        margin: '20px 0',
      }}
    />
  );
};

export default LazyImage;

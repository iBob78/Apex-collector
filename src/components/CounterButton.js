"use client";

import React from 'react';

const CounterButton = () => {
  const [count, setCount] = React.useState(0);

  return (
    <button
      onClick={() => setCount(count + 1)}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      }}
    >
      Compteur : {count}
    </button>
  );
};

export default CounterButton;

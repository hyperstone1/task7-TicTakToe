import React from 'react';
import './index.css';

const Box = ({ index, turn, value }) => {
  return (
    <div style={{}} className="box" onClick={() => turn(index)}>
      {value}
    </div>
  );
};

export default Box;

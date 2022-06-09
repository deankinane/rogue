import React from 'react';
import { createRoot } from 'react-dom/client';
import hljs from 'highlight.js';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { HashRouter } from 'react-router-dom';

const hljsDefineSolidity = require('highlightjs-solidity');
hljsDefineSolidity(hljs);

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
      <img src='./img/circle.png' alt='bg-img-1' className='bg-img-1'/>
      <img src='./img/circle.png' alt='bg-img-2' className='bg-img-2'/>
    </HashRouter>
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

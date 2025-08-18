import React from 'react';
import { NhostProvider } from '@nhost/react';
import { nhost } from './lib/nhost';
import ChatApp from './components/ChatApp';
import './App.css';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <div className="App">
        <ChatApp />
      </div>
    </NhostProvider>
  );
}

export default App;
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { WalletProvider } from './context/WalletContext.js';

createRoot(document.getElementById("root")).render(

    <WalletProvider>
        <App />
    </WalletProvider>

);
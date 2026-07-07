import ChatWidget from './ChatWidget.jsx';
import { COMPANY_NAME } from './config.js';

// Demo host page — stands in for the company website. The widget is fully
// self-contained: on the real site, just render <ChatWidget /> anywhere.
export default function App() {
  return (
    <>
      <div className="demo-page">
        <h1>{COMPANY_NAME}</h1>
        <p>
          Ceci représente le site web de la compagnie. Le widget de chat flotte
          en bas à droite — comme Intercom ou Crisp.
        </p>
      </div>
      <ChatWidget />
    </>
  );
}

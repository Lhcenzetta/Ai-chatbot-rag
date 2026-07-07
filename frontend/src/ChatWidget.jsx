import { useEffect, useRef, useState } from 'react';
import { COMPANY_NAME, COMPANY_TAGLINE, API_URL, SUGGESTIONS } from './config.js';

// ============================================================================
// <ChatWidget /> — self-contained floating chat widget (Intercom/Crisp style).
// Drop it into any page: closed = round launcher bottom-right; open = chat
// panel anchored to the corner. All RAG/chat logic is identical to before —
// only the layout shell changed.
// ============================================================================

// Arabic script detection → used to render a bubble right-to-left
const AR_RE = /[؀-ۿ]/;
const isArabic = (text) => AR_RE.test(text);

// ── Markdown-lite renderer ───────────────────────────────────────────────
// LLMs answer with **bold** and bullet lists; render those properly instead
// of showing raw asterisks. Built with React elements — no innerHTML, so the
// model output can never inject markup.
function renderInline(text) {
  // split on **bold** segments; odd indexes are the bold parts
  return text.split(/\*\*([^*]+)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function renderMarkdownLite(text) {
  const blocks = [];
  let list = null; // {ordered, items}

  const flushList = () => {
    if (list) {
      blocks.push({ type: 'list', ...list });
      list = null;
    }
  };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || ordered) {
      const isOrdered = Boolean(ordered);
      if (!list || list.ordered !== isOrdered) { flushList(); list = { ordered: isOrdered, items: [] }; }
      list.items.push((bullet || ordered)[1]);
    } else {
      flushList();
      blocks.push({ type: 'p', text: line });
    }
  }
  flushList();

  return blocks.map((b, i) => {
    if (b.type === 'p') return <p key={i}>{renderInline(b.text)}</p>;
    const Tag = b.ordered ? 'ol' : 'ul';
    return (
      <Tag key={i}>
        {b.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
      </Tag>
    );
  });
}

// Company logo — simple shield mark; swap for an <img src=...> when the real
// logo is available.
function Logo({ size = 34, light = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 3L34 9v10c0 9-6.3 15.4-14 18C12.3 34.4 6 28 6 19V9l14-6z"
        fill={light ? 'rgba(255,255,255,.22)' : 'url(#logoGrad)'}
        stroke={light ? '#fff' : 'none'}
        strokeWidth={light ? 1.5 : 0}
      />
      <path d="M14 19.5l4.2 4.2L27 15" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <defs>
        <linearGradient id="logoGrad" x1="6" y1="3" x2="34" y2="37">
          <stop stopColor="#0E7490" />
          <stop offset="1" stopColor="#155E75" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// One chat bubble + its source chips. dir/text-align switch for Arabic.
function Message({ msg }) {
  const rtl = isArabic(msg.content);
  return (
    <div className={`msg-row ${msg.role}`}>
      <div className="msg-block">
        <div className={`bubble ${msg.role}`} dir={rtl ? 'rtl' : 'ltr'}>
          {msg.role === 'assistant' ? renderMarkdownLite(msg.content) : msg.content}
        </div>
        {msg.sources?.length > 0 && (
          <div className="sources" title="Documents utilisés pour cette réponse">
            <span className="sources-label">Sources :</span>
            {msg.sources.map((s) => (
              <span key={s} className="source-chip">📄 {s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg-row assistant">
      <div className="bubble assistant typing" aria-label="L'assistant écrit...">
        <span className="dot" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false); // widget open/closed — React state only
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(null); // null = checking
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Health check on load → status dot in the header
  useEffect(() => {
    fetch('/health')
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false));
  }, []);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus the input when the panel opens
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  async function send(text) {
    const question = text.trim();
    if (!question || loading) return;

    const userMsg = { role: 'user', content: question };
    // History = everything before this question, as {role, content} pairs
    const history = messages.map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, sources: data.sources },
      ]);
    } catch (err) {
      console.error('Chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isArabic(question)
            ? 'عذراً، وقع مشكل تقني. تأكد أن الخادم خدام وعاود المحاولة.'
            : "Désolé, une erreur technique s'est produite. Vérifiez que le serveur est démarré puis réessayez.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="chat-widget">
      {/* ── Floating panel (kept mounted so the conversation survives close) ── */}
      <div
        className={`widget-panel ${open ? 'open' : 'closed'}`}
        role="dialog"
        aria-label={`Chat — ${COMPANY_NAME}`}
        aria-hidden={!open}
      >
        <header className="widget-header">
          <Logo size={30} light />
          <div className="header-text">
            <h1>{COMPANY_NAME}</h1>
            <p className="tagline">
              <span className={`status-dot ${online === null ? 'checking' : online ? 'ok' : 'down'}`} />
              {COMPANY_TAGLINE}
            </p>
          </div>
          <button className="close-btn" onClick={() => setOpen(false)} aria-label="Fermer le chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <main className="widget-main">
          {messages.length === 0 ? (
            <div className="welcome">
              <Logo size={54} />
              <h2>Bonjour ! مرحباً</h2>
              <p>
                Posez votre question en français ou en arabe sur nos assurances,
                tarifs, sinistres et horaires.
              </p>
              <div className="suggestions">
                {SUGGESTIONS.map((q) => (
                  <button key={q} className="chip" dir={isArabic(q) ? 'rtl' : 'ltr'} onClick={() => send(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((m, i) => (
                <Message key={i} msg={m} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </main>

        <footer className="widget-footer">
          <form
            className="input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              dir={isArabic(input) ? 'rtl' : 'ltr'}
              placeholder="Écrivez votre message… اكتب رسالتك"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Votre message"
            />
            <button type="submit" className="send-btn" disabled={loading || !input.trim()} aria-label="Envoyer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
          <p className="disclaimer">Démo — données d'exemple · Réponses basées sur les documents de la compagnie</p>
        </footer>
      </div>

      {/* ── Round launcher button (chat icon ↔ X) ── */}
      <button
        className="widget-launcher"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
        aria-expanded={open}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        )}
        {!open && online && <span className="launcher-badge" aria-hidden="true" />}
      </button>
    </div>
  );
}

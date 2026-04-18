const chatEl = document.getElementById('chat');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('send');

function appendMessage(who, text) {
    const div = document.createElement('div');
    div.className = 'msg ' + (who === 'you' ? 'user' : 'assistant');
    div.textContent = text;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
}

async function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    appendMessage('you', text);
    inputEl.value = '';

    try {
        const resp = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({text}),
        });
        const data = await resp.json();
        appendMessage('assistant', data.reply || '(no reply)');
    } catch (err) {
        appendMessage('assistant', 'Error: ' + err.message);
    }
}

sendBtn.addEventListener('click', send);
inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
});

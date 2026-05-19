document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatMain = document.getElementById('chat-main');
    const welcomeState = document.getElementById('welcome-state');
    const messagesContainer = document.getElementById('messages-container');
    const messagesList = document.getElementById('messages-list');
    const typingIndicator = document.getElementById('typing-indicator');
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    const sendButton = document.getElementById('send-btn');
    const suggestedChips = document.getElementById('suggested-chips');

    // Bot SVG Avatar markup for injecting into new AI message bubbles
    const botAvatarSvg = `
        <svg class="bot-avatar-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="msgBotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6366F1" />
                    <stop offset="100%" stop-color="#8B5CF6" />
                </linearGradient>
            </defs>
            <!-- Sparkle Antenna -->
            <path d="M24 2V8M21 5H27" stroke="url(#msgBotGrad)" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="24" cy="2" r="1.5" fill="#8B5CF6"/>
            <!-- Rounded Square Body -->
            <rect x="6" y="10" width="36" height="34" rx="10" fill="url(#msgBotGrad)"/>
            <!-- White dot eyes -->
            <circle cx="17" cy="24" r="2.5" fill="white"/>
            <circle cx="31" cy="24" r="2.5" fill="white"/>
            <!-- Small curved smile line -->
            <path d="M20 30C20 30 22 33 24 33C26 33 28 30 28 30" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;

    // User SVG Avatar markup (initials style circle)
    const userAvatarSvg = `
        <div class="message-avatar-user">
            <svg class="user-avatar-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="msgUserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#6366F1" />
                        <stop offset="100%" stop-color="#8B5CF6" />
                    </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="16" fill="url(#msgUserGrad)"/>
                <text x="16" y="20.5" fill="white" font-size="12" font-weight="bold" text-anchor="middle" font-family="'Inter', sans-serif">U</text>
            </svg>
        </div>
    `;

    let conversationStarted = false;

    // Helper: Scroll chat to the absolute bottom
    function scrollToBottom() {
        chatMain.scrollTop = chatMain.scrollHeight;
    }

    // Helper: Format Current Time (e.g. 1:15 PM)
    function formatTime() {
        const date = new Date();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    // Initialize Conversation: hides welcome screen and displays chat layout
    function startConversation() {
        if (conversationStarted) return;
        conversationStarted = true;
        
        // Hide welcome state
        welcomeState.classList.add('hidden');
        // Show message container
        messagesContainer.classList.remove('hidden');
        scrollToBottom();
    }

    // Add message to layout
    function appendMessage(sender, text) {
        startConversation();

        // Create elements
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${sender}`;

        const avatarWrapper = document.createElement('div');
        avatarWrapper.className = 'message-avatar';

        if (sender === 'ai') {
            avatarWrapper.innerHTML = botAvatarSvg;
        } else {
            avatarWrapper.innerHTML = userAvatarSvg;
        }

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content-wrapper';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = formatTime();

        // Assemble message
        contentWrapper.appendChild(bubble);
        contentWrapper.appendChild(timestamp);

        messageItem.appendChild(avatarWrapper);
        messageItem.appendChild(contentWrapper);

        messagesList.appendChild(messageItem);
        scrollToBottom();
    }

    // Toggle typing indicator visibility
    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        scrollToBottom();
    }

    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    // Handle user prompt sending
    async function handleSendMessage(text) {
        const query = text.trim();
        if (!query) return;

        // Clear input area and reset height
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Add user message
        appendMessage('user', query);

        // Show typing animation
        showTypingIndicator();

        try {
            const origin = window.location.origin;
            const apiUrl = (origin.startsWith('file://') || origin.includes(':3000') || !origin.includes(':8000'))
                ? 'http://127.0.0.1:8000/api/chat'
                : '/api/chat';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: query })
            });

            if (!response.ok) {
                throw new Error('Network response error');
            }

            const data = await response.json();
            hideTypingIndicator();
            appendMessage('ai', data.reply);

        } catch (error) {
            console.error('Error communicating with chatbot RAG backend:', error);
            hideTypingIndicator();
            appendMessage('ai', 'I apologize, but I encountered a connection issue while reaching the server. Please try checking your internet connection or restarting the backend server.');
        }
    }

    // Submit handler
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendMessage(chatInput.value);
    });

    // Auto-resizing textarea & Key Listeners
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight - 4) + 'px';
    });

    chatInput.addEventListener('keydown', (e) => {
        // If user presses Enter without holding Shift, send message
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Suggested Question Chips Click Handlers
    suggestedChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        const questionText = chip.getAttribute('data-question');
        if (questionText) {
            handleSendMessage(questionText);
        }
    });
});

// === Binding Runes: Connect Script to HTML Elements ===
// We need to grab references to the interactive parts of our HTML vessel.
const informalInput = document.getElementById('informal-input'); // The box for raw materials
// const formalOutput = document.getElementById('formal-output');   // The box for the refined product
const chatOutput = document.getElementById('chat-output'); // New output area
const transmuteButton = document.getElementById('transmute-button'); // The catalyst trigger
// const originalButtonText = transmuteButton.textContent; // No longer needed for icon button
const preloader = document.getElementById('preloader'); 
const pagePreloader = document.getElementById('page-preloader');
const mainContent = document.getElementById('main-content');

// === Helper: Scroll chat to bottom ===
function scrollChatToBottom() {
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

// === Helper: Add message to chat ===
function addMessage(text, sender) { // sender can be 'user' or 'alchemist' or 'error'
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    chatOutput.appendChild(messageDiv);
    // Scroll after a tiny delay to allow animation to start
    setTimeout(scrollChatToBottom, 50); 
}

// === Helper: Add initial placeholder content ===
function addInitialPlaceholder() {
    const placeholderContainer = document.createElement('div');
    placeholderContainer.classList.add('chat-placeholder');

    const icon = document.createElement('img');
    icon.src = 'Images/translate.png'; // Path to your icon
    icon.alt = 'Transmute Icon';
    icon.classList.add('translate-icon');

    const text1 = document.createElement('p');
    text1.textContent = 'Transmute';
    text1.classList.add('placeholder-text-large');

    const text2 = document.createElement('p');
    // Use innerHTML to handle the line break
    text2.innerHTML = 'Say what you have to say.<br>We\'ll handle the rest.';
    text2.classList.add('placeholder-text-small');

    placeholderContainer.appendChild(icon);
    placeholderContainer.appendChild(text1);
    placeholderContainer.appendChild(text2);
    
    // Clear any existing messages before adding placeholder
    chatOutput.innerHTML = ''; 
    chatOutput.appendChild(placeholderContainer);
}

// === Page Load Logic ===
window.addEventListener('load', () => {
    // Optional: Add a minimum display time for the preloader (e.g., 1500ms = 1.5s)
    setTimeout(() => {
        if (pagePreloader) { // Check if element exists
            pagePreloader.style.opacity = '0';
            // Use transitionend event to remove preloader after fade-out
            pagePreloader.addEventListener('transitionend', () => {
                pagePreloader.style.display = 'none';
            }, { once: true }); // Run the listener only once
        }
        
        if (mainContent) { // Check if element exists
            mainContent.classList.remove('hidden');
            mainContent.classList.add('visible');
            // Add placeholder content AFTER main content is visible
            addInitialPlaceholder(); 
        }
    }, 1500); // Adjust delay as needed (in milliseconds)

    // Add initial welcome message to chat (optional)
    // setTimeout(() => { addMessage("Welcome! Enter your informal text below and I'll transmute it.", 'alchemist'); }, 1600); // Delay slightly after fade-in
});

// === The NEW Catalyst Rune (Event Listener) ===
// This function now calls our Netlify serverless function
transmuteButton.addEventListener('click', async () => { // Make the listener async
  // Remove placeholder content when user starts interacting
  const placeholder = chatOutput.querySelector('.chat-placeholder');
  if (placeholder) {
      chatOutput.removeChild(placeholder);
  }

  const informalText = informalInput.value.trim();

  if (!informalText) {
    // Optional: Add a temporary error message or shake animation to input
    return;
  }

  // 1. Add user message to chat
  addMessage(informalText, 'user');
  informalInput.value = ''; // Clear input field

  // 2. Show preloader in chat area
  transmuteButton.disabled = true;
  chatOutput.appendChild(preloader); // Move preloader into chat
  preloader.style.display = 'flex';
  scrollChatToBottom();

  try {
    // 3. Call the Serverless Function
    const functionUrl = '/.netlify/functions/generate-email';
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: informalText }),
    });

    // --- Process the Response ---
    preloader.style.display = 'none'; // Hide preloader *before* adding result/error

    if (!response.ok) {
      let errorMsg = `Oracle responded with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.error || 'Unknown error'}`;
      } catch (e) {
        errorMsg += ` - Could not parse error details.`;
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const professionalEmail = data.professionalEmail;

    // 4. Add AI response to chat
    addMessage(professionalEmail, 'alchemist');

  } catch (error) {
    // --- Handle Errors ---
    preloader.style.display = 'none'; // Ensure preloader is hidden on error
    console.error('Error during transmutation:', error);
    addMessage(`An error occurred: ${error.message} Please try again.`, 'error'); // Add error message to chat
  } finally {
    // --- Reset Button --- 
    transmuteButton.disabled = false;
  }
});

// Add event listener for Enter key in input field
informalInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !transmuteButton.disabled) {
        event.preventDefault(); // Prevent default form submission/newline
        transmuteButton.click(); // Trigger button click
    }
});

// --- Initial message on load ---
// (Handled by Page Load Logic now) 
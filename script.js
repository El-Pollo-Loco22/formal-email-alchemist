// === Binding Runes: Connect Script to HTML Elements ===
// We need to grab references to the interactive parts of our HTML vessel.
const informalInput = document.getElementById('informal-input'); // The box for raw materials
const formalOutput = document.getElementById('formal-output');   // The box for the refined product
const transmuteButton = document.getElementById('transmute-button'); // The catalyst trigger

// === The Core Transmutation Spell ===
// This function holds the secret formula for converting informal to formal.
// For now, it uses simple rules (Lesser Incantations). True AI is a Greater Summoning!
function transmuteToFormal(text) {
    let formalText = text; // Start with the original text

    // --- 1. Simple Replacements (Word Transmutation) ---
    // A dictionary of common informal words and their formal counterparts.
    const replacements = {
        "u": "you",
        "r": "are",
        "ur": "your", // Added common one
        "k": "okay", // Added common one
        "im": "I am", // Handle cases like "im hungry"
        "i'm": "I am",
        "i'll": "I will",
        "i'd": "I would", // Added common one
        "wasnt": "was not", // Added common one
        "werent": "were not", // Added common one
        "dont": "do not", // Added common one
        "doesnt": "does not", // Added common one
        "cant": "cannot", // Added common one
        "pls": "please",
        "plz": "please",
        "thx": "thank you",
        "tnx": "thank you",
        "asap": "as soon as possible",
        "idk": "I do not know",
        "btw": "by the way", // Added common one
        "fyi": "for your information", // Added common one
        "lol": "", // Often removed in formal text
        "haha": "", // Often removed in formal text
        "gonna": "going to",
        "wanna": "want to",
        "gotta": "got to",
        "hey": "Hello", // Basic greeting swap
        "yo ": "Hello ", // Note the space
        "sup": "How are you",
        "cya": "See you later",
        // --- Add many more rules here as needed! ---
    };

    // Apply replacements using Regular Expressions for whole words
    // \b ensures we match whole words only (e.g., 'r' doesn't match 'are')
    // 'gi' flags mean global (replace all occurrences) and case-insensitive
    for (const informal in replacements) {
        const regex = new RegExp(`\\b${informal}\\b`, 'gi');
        formalText = formalText.replace(regex, replacements[informal]);
    }

    // --- 2. Structural Glyphs (Email Format) ---
    // Attempt to add basic email structure if missing.

    // Ensure first letter is capitalized
    formalText = formalText.trim(); // Remove leading/trailing whitespace first
    if (formalText.length > 0) {
     formalText = formalText.charAt(0).toUpperCase() + formalText.slice(1);
    }

    // Add a generic opening if one isn't apparent
    // Uses regex: ^ means start of string, i means case-insensitive
    if (!/^(Dear|Hello|Hi |Greetings)/i.test(formalText)) {
        formalText = "Dear [Recipient Name],\n\n" + formalText;
    }

    // Add a generic polite closing if one isn't detected
    // Uses regex: $ means end of string (before potential trailing whitespace)
    if (!/(Sincerely|Best regards|Kind regards|Thank you|Thanks)[,.!?]?\s*$/i.test(formalText)) {
         // Add a period if the last real character isn't punctuation
         if (formalText.length > 0 && !/[.!?]$/.test(formalText.trim())) {
             formalText = formalText.trim() + ".";
         }
         formalText += "\n\nBest regards,\n[Your Name]"; // Add closing block
    }

    // --- 3. Refinement Runes (Minor Fixes) ---
    // Example: Try to ensure sentences after periods start with a capital letter.
    // This is basic and won't catch all edge cases.
    formalText = formalText.replace(/([.?!])\s+([a-z])/g, (match, punctuation, letter) => {
        return `${punctuation} ${letter.toUpperCase()}`;
    });

    // Remove potential double spacing introduced by replacements
    formalText = formalText.replace(/ {2,}/g, ' ');
    formalText = formalText.replace(/\n /g, '\n'); // Fix space after newline

    return formalText; // Return the transmuted text!
}

// === The Catalyst Rune (Event Listener) ===
// This tells the button to perform the transmutation spell when clicked.
transmuteButton.addEventListener('click', () => {
    // 1. Get the raw text from the input box
    const informalText = informalInput.value;

    // 2. Check if there's actually text to transmute
    if (!informalText.trim()) {
        formalOutput.value = "Please enter some text into the 'Informal Text' box first.";
        return; // Stop if nothing was entered
    }

    // 3. Perform the transmutation using our spell function
    const formalText = transmuteToFormal(informalText);

    // 4. Display the refined result in the output box
    formalOutput.value = formalText;
});

// --- Initial message on load (Optional) ---
formalOutput.value = "The refined message will appear here once you enter text above and click 'Transmute!'"; 
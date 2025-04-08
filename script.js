// === Binding Runes: Connect Script to HTML Elements ===
// We need to grab references to the interactive parts of our HTML vessel.
const informalInput = document.getElementById('informal-input'); // The box for raw materials
const formalOutput = document.getElementById('formal-output');   // The box for the refined product
const transmuteButton = document.getElementById('transmute-button'); // The catalyst trigger
const originalButtonText = transmuteButton.textContent; // Store original button text

// === The NEW Catalyst Rune (Event Listener) ===
// This function now calls our Netlify serverless function
transmuteButton.addEventListener('click', async () => { // Make the listener async
  const informalText = informalInput.value.trim();

  if (!informalText) {
    formalOutput.value = "Please enter some text into the 'Informal Text' box first.";
    return;
  }

  // --- UI Feedback: Indicate Loading ---
  transmuteButton.disabled = true;
  transmuteButton.textContent = 'Consulting Oracle...';
  formalOutput.value = 'The Oracle is contemplating... please wait.';
  formalOutput.style.color = '#555'; // Dim text during loading

  try {
    // --- Call the Serverless Function ---
    // Use the relative path provided by Netlify for functions
    const functionUrl = '/.netlify/functions/generate-email';

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send the text in the expected JSON format { "text": "..." }
      body: JSON.stringify({ text: informalText }),
    });

    // --- Process the Response ---
    if (!response.ok) {
      // Try to get error details from the function's response body
      let errorMsg = `Oracle responded with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg += ` - ${errorData.error || 'Unknown error'}`;
      } catch (e) {
        // Could not parse JSON error body
        errorMsg += ` - Could not parse error details.`;
      }
      throw new Error(errorMsg); // Throw an error to be caught below
    }

    // If response is OK (status 200-299)
    const data = await response.json();
    const professionalEmail = data.professionalEmail; // Expecting { "professionalEmail": "..." }

    // Display the result
    formalOutput.value = professionalEmail;
    formalOutput.style.color = '#333'; // Restore normal text color

  } catch (error) {
    // --- Handle Errors (Network or thrown above) ---
    console.error('Error during transmutation:', error);
    formalOutput.value = `An error occurred: ${error.message}\n\nPlease check the console or try again later. Ensure the API key is configured correctly in Netlify.`;
    formalOutput.style.color = 'red'; // Make errors stand out
  } finally {
    // --- UI Feedback: Reset Button ---
    // This runs whether the try block succeeded or failed
    transmuteButton.disabled = false;
    transmuteButton.textContent = originalButtonText; // Restore original text
  }
});

// --- Initial message on load ---
formalOutput.value = "Enter text above, then click 'Transmute!' to consult the AI Oracle."; 
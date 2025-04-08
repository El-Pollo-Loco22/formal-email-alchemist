// Import the built-in fetch API (available in modern Node.js on Netlify)
// No external dependencies needed for this simple fetch!

// Netlify Functions handler
exports.handler = async (event, context) => {
  // 1. Check if the request method is POST (we expect data)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: 'Only POST requests are accepted' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // 2. Get the API Key from environment variables (SAFE!)
  // We will set this up in Netlify settings later
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    console.error('API Key not found in environment variables.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API Key configuration error on server.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // 3. Get the input text from the request body sent by the browser script
  let inputText = '';
  try {
    const body = JSON.parse(event.body);
    inputText = body.text || ''; // Expecting { "text": "user input here" }
    if (!inputText) throw new Error('Input text is empty.');
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({ error: 'Invalid request body. Expected { "text": "..." }' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  // 4. Construct the Prompt for the Google AI (Gemini)
  // This is where you instruct the AI! Be specific.
  const prompt = `Please rewrite the following text into a professional email. Ensure it has a clear subject line (on the first line, starting with "Subject: "), an appropriate greeting, a well-structured body based on the input text, and a professional closing. Input Text: "${inputText}"`;

  // 5. Prepare the request to the Google Gemini API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    // Optional: Add safety settings or generation config if needed
    // generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    // safetySettings: [ { category: "HARM_CATEGORY...", threshold: "BLOCK_MEDIUM_AND_ABOVE" } ]
  };

  // 6. Call the Google AI Oracle (API Request)
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Handle errors from the Google AI API itself
      const errorData = await response.json();
      console.error('Google AI API Error:', response.status, errorData);
      throw new Error(`Google AI API Error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // 7. Extract the generated email text from the response
    // The structure might vary slightly based on the model/API version
    // Check Google AI documentation if this path is wrong
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
        console.error('Could not extract generated text from API response:', JSON.stringify(data));
        throw new Error('Failed to extract generated text from AI response.');
    }

    // 8. Send the result back to the browser script
    return {
      statusCode: 200,
      // IMPORTANT: Set CORS header to allow browser access from your Netlify domain
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allows access from any origin (simplest)
        // For stricter control, you'd use your Netlify site URL instead of '*'
        // 'Access-Control-Allow-Origin': 'https://your-site-name.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and preflight OPTIONS requests
      },
      body: JSON.stringify({ professionalEmail: generatedText }),
    };

  } catch (error) {
    console.error('Error during API call or processing:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to generate email. ${error.message}` }),
       headers: {
         'Content-Type': 'application/json',
         'Access-Control-Allow-Origin': '*' // Also include CORS headers on error
       },
    };
  }
}; 
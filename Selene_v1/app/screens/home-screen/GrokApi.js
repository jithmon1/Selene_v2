import Groq from "groq-sdk";


// Replace 'your-api-key-here' with your actual API key
const groq = new Groq({ apiKey: '',
  dangerouslyAllowBrowser: true, // Allow the Groq client to be used in the browser
 });




/**
 
 * @param {Array} messages 
 * @returns {Object} 
 */
export const fetchDataFromGrok = async (messages) => {
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile", 
      temperature: 0.5,
    });
    return completion.choices[0]?.message?.content; 
  } catch (error) {
    console.error("Error fetching data from Groq:", error);
    throw error;
  }
};

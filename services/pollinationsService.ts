/**
 * Generates an image URL from Pollinations.ai.
 * This service is open source and does not require an API key.
 * @param prompt The text prompt for the image.
 * @param width The desired width of the image.
 * @param height The desired height of the image.
 * @returns The direct URL to the generated image.
 */
export function generateImage(prompt: string, width?: number, height?: number): string {
    if (!prompt.trim()) {
        throw new Error("Prompt cannot be empty.");
    }
    const encodedPrompt = encodeURIComponent(prompt);
    // Pollinations can sometimes be slow, appending a random seed can help get a fresh image.
    const seed = Math.floor(Math.random() * 10000);
    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}`;
    if (width) url += `&width=${width}`;
    if (height) url += `&height=${height}`;
    return url;
}


/**
 * Generates text from Pollinations.ai.
 * This service is open source and does not require an API key.
 * @param prompt The text prompt for the text generation.
 * @returns A promise that resolves with the generated text.
 */
export async function generateText(prompt: string): Promise<string> {
    if (!prompt.trim()) {
        throw new Error("Prompt cannot be empty.");
    }
    const encodedPrompt = encodeURIComponent(prompt);
    // Using a CORS proxy to bypass potential browser restrictions
    const url = `https://api.allorigins.win/raw?url=https://text.pollinations.ai/${encodedPrompt}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to generate text from Pollinations.ai. Status: ${response.status}`);
    }
    const result = await response.json();
    return result.text || "No text was generated.";
}

import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.error("API_KEY environment variable not set. Gemini API will not be available.");
}

export const getDailyBriefing = async (
    date: Date,
    status: 'offshore' | 'onshore' | 'travel',
    isFirstDay: boolean,
    isLastDay: boolean
): Promise<string> => {
    if (!ai) {
        return Promise.resolve("<h2>AI Assistant Unavailable</h2><p>The Gemini API key is not configured. Please set the API_KEY environment variable.</p>");
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(date);

    let systemInstruction: string;
    let userQuery: string;
    let useGrounding = false;

    if (status === 'offshore') {
        systemInstruction = "You are an AI assistant for an offshore worker. Generate a concise, helpful daily briefing in Markdown format. Ensure lists are properly formatted.";
        userQuery = `For ${formattedDate}, which is an offshore day, provide a briefing. `;
        if (isFirstDay) {
            userQuery += `It's the first day of the hitch, so give me a "Hitch Start Checklist" with at least 4 important items.`;
        } else if (isLastDay) {
            userQuery += `It's the crossover day, so create a "Crossover Checklist" with at least 4 items for a smooth handover.`;
        } else {
            userQuery += `Provide a "Daily Focus" with a suggested task, a relevant safety reminder, and one motivational quote.`;
        }
    } else if (status === 'travel') {
        systemInstruction = "You are an AI assistant for an offshore worker on a travel day. Generate a concise, helpful daily briefing in Markdown format. Ensure lists are properly formatted.";
        userQuery = `For ${formattedDate}, which is a travel day for my offshore rotation, provide a "Travel Day Checklist". Include items like checking travel documents, confirming flight/transport details, packing last-minute essentials, and a reminder to notify family of travel plans.`;
    } else { // Onshore
        systemInstruction = "You are a helpful AI life-coach for an offshore worker on their leave. Generate a concise, helpful daily briefing in Markdown format using Google Search for timely info. Ensure lists are properly formatted.";
        userQuery = `I am an offshore worker on leave in my hometown. For today, ${formattedDate}, suggest one local activity or event happening today, one productive personal task, and one idea for relaxation.`;
        useGrounding = true;
    }

    try {
        // FIX: Updated the request object to align with current @google/genai SDK guidelines.
        // - Removed deprecated `GenerateContentRequest` type.
        // - `contents` is now a simple string.
        // - `systemInstruction` is now a simple string, not an object.
        const request: {
            model: string;
            contents: string;
            config: any;
        } = {
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                systemInstruction: systemInstruction,
            }
        };

        if (useGrounding && request.config) {
            request.config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent(request);
        const text = response.text;
        
        let finalContent = parseMarkdownToHtml(text);
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            const sources = response.candidates[0].groundingMetadata.groundingChunks;
            if (sources.length > 0) {
                finalContent += '<h3>Sources</h3><ul>';
                sources.forEach((source: any) => {
                    if (source.web) {
                         finalContent += `<li><a href="${source.web.uri}" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:underline">${source.web.title || source.web.uri}</a></li>`;
                    }
                });
                finalContent += '</ul>';
            }
        }
        return finalContent;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "<h2>Error</h2><p>Sorry, the AI assistant is currently unavailable. Please try again later.</p>";
    }
};

export const parseMarkdownToHtml = (markdown: string): string => {
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(\r\n|\n){2,}/g, '</p><p>')
        .replace(/(\r\n|\n)/g, '<br/>')
        .replace(/<\/li><br\/>/g, '</li>')
        .replace(/<\/li><br\/>/g, '</li>') // Run again for consecutive items
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/<\/ul><br\/><ul>/gs, '');
};
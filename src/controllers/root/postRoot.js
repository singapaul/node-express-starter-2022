import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

async function main(req) {
    const { count, prompt } = req.body;

    const messages = [
        { role: "system", content: 'You are a helpful playlist generating assistant. You should generate a list of songs and their artists according to a text prompt. You should return a JSON array where each element follows this format: {song : <song_title>, artist : <artist_name>}' },
        { role: "user", content: "Generate a list 10 of songs based on this prompt:  love songs" },
        { role: "assistant", content: `[
            {"song": "Sexyback", "artist": "Justin Timberlake"},
            {"song": "Pony", "artist": "Ginuwine"},
            {"song": "Talk Dirty", "artist": "Jason Derulo ft. 2 Chainz"},
            {"song": "I'm a Slave 4 U", "artist": "Britney Spears"},
            {"song": "Partition", "artist": "Beyoncé"},
            {"song": "Earned It", "artist": "The Weeknd"},
            {"song": "Buttons", "artist": "The Pussycat Dolls"},
            {"song": "Motivation", "artist": "Kelly Rowland"},
            {"song": "Slow Motion", "artist": "Trey Songz"},
            {"song": "Pillowtalk", "artist": "Zayn"}
            ]` }, { role: "user", content: `Generate a list of ${count} songs based on this prompt: ${prompt}` }
    ];

    try {
        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo',
        });

        console.log(chatCompletion);
        const cleanJSONString = chatCompletion.choices[0].message.content;
        const cleanJSON = JSON.parse(cleanJSONString);
        return cleanJSON;
    } catch (error) {
        console.error("Error:", error);
        return null; // Return null or handle the error accordingly
    }
}

/**
 * Echo endpoint
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
const postRoot = async (req, res) => {
    console.log(req.body); // Check if request body is being received correctly
    const data = await main(req);
   
    if (data !== null) {
        res.status(200).json({ data });
    } else {
        res.status(500).json({ error: "Internal server error" });
    }
};

export default postRoot;

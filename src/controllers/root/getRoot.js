import config from '../../config.js';
import OpenAI from 'openai';
 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
  });
  
  async function main() {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: 'Say this is a test' }],
      model: 'gpt-3.5-turbo',
    });
    return chatCompletion
  }

 
/**
 * Health check endpoint
 * @param {import('express').Request} _req 
 * @param {import('express').Response} res 
 */
const getRoot =  async(_req, res) => {


    const data = await main()
    res.status(200).json({
        name: config.name,
        description: config.description,
        version: config.version,
        data,
    });
}

export default getRoot
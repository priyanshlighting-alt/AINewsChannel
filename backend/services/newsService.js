const axios = require('axios');
const { addLog } = require('./logService');

/**
 * Fetch top headlines from NewsAPI for India + World
 */
async function fetchNews(newsApiKey) {
  addLog('info', 'Fetching news from NewsAPI...');

  const queries = [
    `https://newsapi.org/v2/top-headlines?country=in&pageSize=5&apiKey=${newsApiKey}`,
    `https://newsapi.org/v2/top-headlines?language=en&category=general&pageSize=5&apiKey=${newsApiKey}`,
  ];

  const results = [];
  for (const url of queries) {
    try {
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data && res.data.articles) {
        results.push(...res.data.articles.filter(a => a.title && a.description));
      }
    } catch (err) {
      addLog('warn', `NewsAPI request failed: ${err.message}`);
    }
  }

  // Deduplicate by title
  const seen = new Set();
  const unique = results.filter(a => {
    if (seen.has(a.title)) return false;
    seen.add(a.title);
    return true;
  });

  addLog('success', `Fetched ${unique.length} articles.`);
  return unique.slice(0, 6);
}

/**
 * Generate Marathi news script from articles using OpenAI or Groq
 */
async function generateMarathiScript(articles, openaiApiKey, groqApiKey) {
  addLog('info', 'Generating Marathi news script using AI...');

  const articleSummary = articles
    .map((a, i) => `${i + 1}. ${a.title}: ${a.description || ''}`)
    .join('\n');

  const systemPrompt = `तुम्ही एक मराठी बातम्या सादरकर्ते आहात. खालील इंग्रजी बातम्या वाचा आणि प्रत्येक बातमी मराठीत रूपांतरित करा.
नियम:
- फक्त मराठी भाषा वापरा, एकही इंग्रजी शब्द नाही.
- प्रत्येक बातमीसाठी: मथळा (headline) आणि ३-५ ओळींचे वर्णन (description) द्या.
- एकूण ३-४ बातम्या द्या.
- बातम्या व्यावसायिक आणि स्पष्ट असाव्यात.
- उत्तर फक्त मराठीत असावे.

फॉर्मेट:
## बातमी १
**मथळा:** [मराठी मथळा]
**वर्णन:** [मराठी वर्णन]

## बातमी २
...`;

  const userPrompt = `बातम्या:\n${articleSummary}`;

  // Try OpenAI first
  if (openaiApiKey) {
    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        },
        {
          headers: { Authorization: `Bearer ${openaiApiKey}` },
          timeout: 30000,
        }
      );
      const script = res.data.choices[0].message.content;
      addLog('success', 'Marathi script generated via OpenAI.');
      return script;
    } catch (err) {
      addLog('warn', `OpenAI failed: ${err.message}. Trying Groq...`);
    }
  }

  // Fallback to Groq
  if (groqApiKey) {
    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        },
        {
          headers: { Authorization: `Bearer ${groqApiKey}` },
          timeout: 30000,
        }
      );
      const script = res.data.choices[0].message.content;
      addLog('success', 'Marathi script generated via Groq.');
      return script;
    } catch (err) {
      addLog('error', `Groq also failed: ${err.message}`);
      throw new Error('Both OpenAI and Groq failed to generate script.');
    }
  }

  throw new Error('No AI API key configured (OpenAI or Groq required).');
}

/**
 * Extract headline from script for overlay text
 */
function extractHeadline(script) {
  const match = script.match(/\*\*मथळा:\*\*\s*(.+)/);
  if (match) return match[1].trim();
  const lines = script.split('\n').filter(l => l.trim());
  return lines[0].replace(/[#*]/g, '').trim().substring(0, 80);
}

module.exports = { fetchNews, generateMarathiScript, extractHeadline };

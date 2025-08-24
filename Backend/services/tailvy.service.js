// services/tavily.service.js
const axios = require('axios');

class TavilyService {
    constructor() {
        this.apiKey = process.env.TAVILY_API_KEY;
        this.baseURL = 'https://api.tavily.com';
        
        if (!this.apiKey) {
            console.warn('TAVILY_API_KEY not found in environment variables');
        }
    }

    /**
     * Search for general information using Tavily API
     * @param {string} query - The search query
     * @param {Object} options - Additional search options
     * @returns {Promise<Object>} Search results
     */
    async search(query, options = {}) {
        try {
            if (!this.apiKey) {
                throw new Error('Tavily API key is not configured');
            }

            const searchOptions = {
                api_key: this.apiKey,
                query: query,
                search_depth: options.search_depth || 'basic', // 'basic' or 'advanced'
                include_answer: options.include_answer !== false, // default true
                include_raw_content: options.include_raw_content || false,
                max_results: options.max_results || 5,
                include_domains: options.include_domains || [],
                exclude_domains: options.exclude_domains || [],
                ...options
            };

            const response = await axios.post(`${this.baseURL}/search`, searchOptions, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 seconds timeout
            });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('Tavily search error:', error.message);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Search specifically for crypto/financial related general queries
     * @param {string} query - The search query
     * @returns {Promise<Object>} Search results
     */
    async searchCryptoGeneral(query) {
        const cryptoOptions = {
            search_depth: 'advanced',
            max_results: 3,
            include_answer: true,
            // Include reputable crypto news and information sources
            include_domains: [
                'bitget.site',
                'coindesk.com',
                'coingecko.com',
                'cointelegraph.com',
                'coinbase.com',
                'binance.com'
            ]
        };

        return await this.search(query, cryptoOptions);
    }

    /**
     * Get a quick answer for simple questions
     * @param {string} question - The question to answer
     * @returns {Promise<Object>} Quick answer
     */
    async getQuickAnswer(question) {
        try {
            if (!this.apiKey) {
                throw new Error('Tavily API key is not configured');
            }

            const response = await axios.post(`${this.baseURL}/search`, {
                api_key: this.apiKey,
                query: question,
                search_depth: 'basic',
                include_answer: true,
                max_results: 1,
                format: 'json'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 8000
            });

            return {
                success: true,
                answer: response.data.answer || 'No direct answer found',
                sources: response.data.results || []
            };

        } catch (error) {
            console.error('Tavily quick answer error:', error.message);
            return {
                success: false,
                error: error.message,
                answer: null,
                sources: []
            };
        }
    }
}

module.exports = new TavilyService();
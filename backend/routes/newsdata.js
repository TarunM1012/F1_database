const express = require('express');
const router = express.Router();
const axios = require('axios');
const { verifyToken } = require('../auth');

// Apply authentication middleware
router.use(verifyToken);

/**
 * Get trending F1 news using NewsData.io API
 */
router.get('/news/trending', async (req, res) => {
    try {
        const apiKey = process.env.NEWSDATA_API_KEY || 'pub_82ea2edfc06544baba45b76bbfa50740';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        if (!apiKey || apiKey === 'your_newsdata_api_key_here') {
            return res.status(400).json({
                success: false,
                error: 'NewsData.io API key not configured'
            });
        }
        
        // Search for Formula 1 news
        // Note: Free tier may not support all parameters
        const response = await axios.get(
            'https://newsdata.io/api/1/news',
            {
                params: {
                    apikey: apiKey,
                    q: 'F1 OR "Formula One" OR "Formula 1" OR "Grand Prix"',
                    language: 'en',
                    size: limit
                },
                timeout: 10000
            }
        );
        
        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Failed to fetch news');
        }
        
        // Format and filter news articles - only F1 related
        const f1Keywords = ['f1', 'formula 1', 'formula one', 'grand prix', 'formula1', 'formula-1'];
        const articles = (response.data.results || [])
            .filter(article => {
                const title = (article.title || '').toLowerCase();
                const description = (article.description || '').toLowerCase();
                const content = (article.content || '').toLowerCase();
                const text = `${title} ${description} ${content}`;
                return f1Keywords.some(keyword => text.includes(keyword));
            })
            .map((article, index) => ({
                id: article.article_id || `news-${Date.now()}-${index}`,
                title: article.title || 'No title',
                description: article.description || article.content || 'No description available',
                content: article.content || '',
                link: article.link || '',
                image_url: article.image_url || null,
                source: article.source_id || 'Unknown',
                author: article.creator ? (Array.isArray(article.creator) ? article.creator[0] : article.creator) : null,
                published_at: article.pubDate || new Date().toISOString(),
                category: article.category ? (Array.isArray(article.category) ? article.category[0] : article.category) : 'sports',
                keywords: article.keywords || []
            }));
        
        res.json({
            success: true,
            data: {
                articles: articles,
                total_results: response.data.totalResults || articles.length,
                page: page,
                limit: limit,
                next_page: response.data.nextPage || null
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('NewsData.io API error:', error.message);
        
        // Check if it's an API key error
        if (error.response && error.response.status === 401) {
            return res.status(401).json({
                success: false,
                error: 'Invalid NewsData.io API key'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch news from NewsData.io'
        });
    }
});

/**
 * Get latest F1 news (cached or fresh)
 */
router.get('/news/latest', async (req, res) => {
    try {
        const apiKey = process.env.NEWSDATA_API_KEY || 'pub_82ea2edfc06544baba45b76bbfa50740';
        const limit = parseInt(req.query.limit) || 5;
        
        if (!apiKey || apiKey === 'your_newsdata_api_key_here') {
            return res.status(400).json({
                success: false,
                error: 'NewsData.io API key not configured'
            });
        }
        
        const response = await axios.get(
            'https://newsdata.io/api/1/news',
            {
                params: {
                    apikey: apiKey,
                    q: 'F1 OR "Formula One" OR "Formula 1" OR "Grand Prix"',
                    language: 'en',
                    size: limit
                },
                timeout: 10000
            }
        );
        
        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Failed to fetch news');
        }
        
        // Format and filter news articles - only F1 related
        const f1Keywords = ['f1', 'formula 1', 'formula one', 'grand prix', 'formula1', 'formula-1'];
        const articles = (response.data.results || [])
            .filter(article => {
                const title = (article.title || '').toLowerCase();
                const description = (article.description || '').toLowerCase();
                const content = (article.content || '').toLowerCase();
                const text = `${title} ${description} ${content}`;
                return f1Keywords.some(keyword => text.includes(keyword));
            })
            .map((article, index) => ({
                id: article.article_id || `news-${Date.now()}-${index}`,
                title: article.title || 'No title',
                description: article.description || article.content || 'No description available',
                content: article.content || '',
                link: article.link || '',
                image_url: article.image_url || null,
                source: article.source_id || 'Unknown',
                author: article.creator ? (Array.isArray(article.creator) ? article.creator[0] : article.creator) : null,
                published_at: article.pubDate || new Date().toISOString(),
                category: article.category ? (Array.isArray(article.category) ? article.category[0] : article.category) : 'sports'
            }));
        
        res.json({
            success: true,
            data: articles,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('NewsData.io API error:', error.message);
        
        if (error.response && error.response.status === 401) {
            return res.status(401).json({
                success: false,
                error: 'Invalid NewsData.io API key'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch news from NewsData.io'
        });
    }
});

module.exports = router;


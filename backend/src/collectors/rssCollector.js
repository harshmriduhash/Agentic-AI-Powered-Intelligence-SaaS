import Parser from 'rss-parser';

class RSSCollector {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['description', 'content:encoded']
      }
    });
  }

  async fetchFeed(url, source = 'blog') {
    try {
      const feed = await this.parser.parseURL(url);
      
      return feed.items.slice(0, 5).map(item => ({
        source: 'rss',
        sourceId: `rss-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
        title: item.title,
        content: item.contentSnippet || item.description || '',
        url: item.link,
        category: 'announcement',
        rawData: {
          feedTitle: feed.title,
          author: item.creator || item.author,
          categories: item.categories
        },
        publishedAt: new Date(item.pubDate || item.isoDate),
        topics: this.inferTopics(url, item)
      }));
    } catch (error) {
      console.error(`[RSS] Error fetching ${url}:`, error.message);
      return [];
    }
  }

  inferTopics(url, item) {
    const topics = [];
    const text = `${url} ${item.title} ${item.contentSnippet || ''}`.toLowerCase();

    if (text.includes('react') || text.includes('vue') || text.includes('javascript')) {
      topics.push('technology');
    }

    if (text.includes('ai') || text.includes('machine learning') || text.includes('gpt')) {
      topics.push('ai');
    }

    if (text.includes('cloud') || text.includes('aws') || text.includes('azure')) {
      topics.push('cloud');
    }

    if (text.includes('security') || text.includes('vulnerability')) {
      topics.push('technology');
    }

    if (text.includes('politics') || text.includes('government')) {
      topics.push('politics');
    }

    if (text.includes('crypto') || text.includes('blockchain') || text.includes('startup')) {
      topics.push('startups');
    }

    return topics.length > 0 ? topics : ['technology'];
  }

  async collectAll() {
    const feeds = [
      // Tech Blogs
      'https://blog.cloudflare.com/rss/',
      'https://aws.amazon.com/blogs/aws/feed/',
      'https://react.dev/rss.xml',
      'https://nodejs.org/en/feed/blog.xml',
      
      // AI/ML
      'https://openai.com/blog/rss.xml',
      'https://www.anthropic.com/news/rss.xml',
      
      // Security
      'https://krebsonsecurity.com/feed/',
      'https://threatpost.com/feed/',
      
      // General Tech News
      'https://techcrunch.com/feed/',
      'https://www.theverge.com/rss/index.xml'
    ];

    const allItems = [];

    for (const feedUrl of feeds) {
      console.log(`[RSS] Fetching ${feedUrl}...`);
      const items = await this.fetchFeed(feedUrl);
      allItems.push(...items);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[RSS] Collected ${allItems.length} items`);
    return allItems;
  }
}

export default new RSSCollector();
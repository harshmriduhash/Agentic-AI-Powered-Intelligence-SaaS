import axios from 'axios';

class RedditCollector {
  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID;
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET;
    this.userAgent = process.env.REDDIT_USER_AGENT || 'ContextaBot/1.0';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('[Reddit] Authenticated successfully');
      return this.accessToken;
    } catch (error) {
      console.error('[Reddit] Authentication failed:', error.message);
      throw error;
    }
  }

  async fetchSubreddit(subreddit, limit = 25) {
    await this.authenticate();

    try {
      const response = await axios.get(
        `https://oauth.reddit.com/r/${subreddit}/new`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': this.userAgent
          },
          params: { limit }
        }
      );

      return response.data.data.children.map(post => this.transformPost(post.data));
    } catch (error) {
      console.error(`[Reddit] Error fetching r/${subreddit}:`, error.message);
      return [];
    }
  }

  transformPost(post) {
    return {
      source: 'reddit',
      sourceId: post.id,
      title: post.title,
      content: post.selftext || '',
      url: `https://reddit.com${post.permalink}`,
      rawData: {
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
        numComments: post.num_comments,
        created: post.created_utc
      },
      publishedAt: new Date(post.created_utc * 1000),
      topics: this.inferTopics(post)
    };
  }

  inferTopics(post) {
    const topics = [];
    const text = `${post.title} ${post.selftext}`.toLowerCase();
    const subreddit = post.subreddit.toLowerCase();

    // Technology
    if (['programming', 'webdev', 'reactjs', 'nodejs', 'devops', 'selfhosted', 'sysadmin'].includes(subreddit)) {
      topics.push('technology');
    }

    // AI
    if (['machinelearning', 'artificialintelligence', 'localllama', 'singularity'].includes(subreddit) ||
      text.includes('ai') || text.includes('machine learning')) {
      topics.push('ai');
    }

    // Cloud
    if (['aws', 'azure', 'googlecloud', 'cloudcomputing'].includes(subreddit) ||
      text.includes('cloud') || text.includes('kubernetes')) {
      topics.push('cloud');
    }

    // Cybersecurity
    if (['netsec', 'cybersecurity', 'infosec'].includes(subreddit)) {
      topics.push('cybersecurity');
    }

    // Politics
    if (['politics', 'worldnews', 'news'].includes(subreddit)) {
      topics.push('politics');
    }

    // Finance
    if (['economics', 'finance', 'stocks', 'investing'].includes(subreddit)) {
      topics.push('finance');
    }

    // Web3
    if (['cryptocurrency', 'ethereum', 'bitcoin', 'web3'].includes(subreddit)) {
      topics.push('web3');
    }

    // Startups
    if (['startups', 'entrepreneur'].includes(subreddit)) {
      topics.push('startups');
    }

    return topics.length > 0 ? topics : ['technology'];
  }

  async collectAll() {
    const subreddits = [
      // Technology
      'programming', 'webdev', 'reactjs', 'nodejs', 'rust',
      // DevOps & Cloud
      'devops', 'kubernetes', 'aws', 'docker',
      // AI
      'machinelearning', 'artificial', 'localllama',
      // Security
      'netsec', 'cybersecurity',
      // Web3
      'cryptocurrency', 'ethereum',
      // General Tech News
      'technology', 'selfhosted', 'opensource'
    ];

    const allPosts = [];

    for (const subreddit of subreddits) {
      console.log(`[Reddit] Fetching r/${subreddit}...`);
      const posts = await this.fetchSubreddit(subreddit, 10);
      allPosts.push(...posts);

      // Rate limiting - be nice to Reddit
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`[Reddit] Collected ${allPosts.length} posts`);
    return allPosts;
  }
}

export default new RedditCollector();
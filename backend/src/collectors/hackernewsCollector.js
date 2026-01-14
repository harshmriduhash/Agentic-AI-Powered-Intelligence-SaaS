import axios from 'axios';

class HackerNewsCollector {
  constructor() {
    this.baseURL = 'https://hacker-news.firebaseio.com/v0';
  }

  async fetchTopStories(limit = 30) {
    try {
      const { data: storyIds } = await axios.get(`${this.baseURL}/topstories.json`);
      const topIds = storyIds.slice(0, limit);

      const stories = await Promise.all(
        topIds.map(id => this.fetchStory(id))
      );

      return stories.filter(Boolean);
    } catch (error) {
      console.error('[HackerNews] Error fetching stories:', error.message);
      return [];
    }
  }

  async fetchStory(id) {
    try {
      const { data: story } = await axios.get(`${this.baseURL}/item/${id}.json`);
      
      if (!story || story.type !== 'story') return null;

      return {
        source: 'hackernews',
        sourceId: `hn-${story.id}`,
        title: story.title,
        content: story.text || '',
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        category: 'announcement',
        rawData: {
          by: story.by,
          score: story.score,
          descendants: story.descendants
        },
        publishedAt: new Date(story.time * 1000),
        topics: this.inferTopics(story)
      };
    } catch (error) {
      return null;
    }
  }

  inferTopics(story) {
    const topics = ['technology'];
    const text = `${story.title} ${story.text || ''}`.toLowerCase();

    if (text.includes('ai') || text.includes('gpt') || text.includes('llm')) {
      topics.push('ai');
    }

    if (text.includes('cloud') || text.includes('kubernetes') || text.includes('aws')) {
      topics.push('cloud');
    }

    if (text.includes('startup') || text.includes('funding')) {
      topics.push('startups');
    }

    if (text.includes('security') || text.includes('breach') || text.includes('hack')) {
      topics.push('technology');
    }

    return [...new Set(topics)];
  }

  async collectAll() {
    console.log('[HackerNews] Fetching top stories...');
    const stories = await this.fetchTopStories(20);
    console.log(`[HackerNews] Collected ${stories.length} stories`);
    return stories;
  }
}

export default new HackerNewsCollector();
import axios from 'axios';

class GitHubCollector {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.baseURL = 'https://api.github.com';
  }

  async fetchReleases(owner, repo) {
    try {
      const response = await axios.get(
        `${this.baseURL}/repos/${owner}/${repo}/releases`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          params: { per_page: 5 }
        }
      );

      return response.data.map(release => this.transformRelease(release, owner, repo));
    } catch (error) {
      console.error(`[GitHub] Error fetching ${owner}/${repo}:`, error.message);
      return [];
    }
  }

  transformRelease(release, owner, repo) {
    return {
      source: 'github',
      sourceId: `github-${release.id}`,
      title: `${owner}/${repo} ${release.tag_name} Released`,
      content: release.body || '',
      url: release.html_url,
      category: 'release',
      rawData: {
        owner,
        repo,
        tagName: release.tag_name,
        prerelease: release.prerelease,
        draft: release.draft,
        author: release.author?.login
      },
      publishedAt: new Date(release.published_at),
      topics: this.inferTopics(owner, repo)
    };
  }

  async fetchSecurityAdvisories() {
    try {
      const response = await axios.get(
        `${this.baseURL}/advisories`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          params: { per_page: 10 }
        }
      );

      return response.data.map(advisory => ({
        source: 'github',
        sourceId: `github-advisory-${advisory.ghsa_id}`,
        title: `Security Advisory: ${advisory.summary}`,
        content: advisory.description,
        url: advisory.html_url,
        category: 'security',
        rawData: {
          severity: advisory.severity,
          cve_id: advisory.cve_id,
          cwes: advisory.cwes
        },
        publishedAt: new Date(advisory.published_at),
        topics: ['cybersecurity', 'technology']
      }));
    } catch (error) {
      console.error('[GitHub] Error fetching advisories:', error.message);
      return [];
    }
  }

  inferTopics(owner, repo) {
    const topics = ['technology'];
    const repoLower = repo.toLowerCase();
    const ownerLower = owner.toLowerCase();

    if (['react', 'vue', 'angular', 'svelte'].includes(repoLower)) {
      topics.push('technology');
    }

    if (['kubernetes', 'docker', 'terraform'].includes(repoLower)) {
      topics.push('cloud', 'devops');
    }

    if (['openai', 'langchain', 'llama'].some(term => repoLower.includes(term))) {
      topics.push('ai');
    }

    if (['bitcoin', 'ethereum', 'solana'].includes(repoLower)) {
      topics.push('web3', 'finance');
    }

    return [...new Set(topics)];
  }

  async collectAll() {
    const repositories = [
      // Frontend Frameworks
      { owner: 'facebook', repo: 'react' },
      { owner: 'vuejs', repo: 'core' },
      { owner: 'angular', repo: 'angular' },
      { owner: 'sveltejs', repo: 'svelte' },
      
      // Backend
      { owner: 'nodejs', repo: 'node' },
      { owner: 'denoland', repo: 'deno' },
      { owner: 'nestjs', repo: 'nest' },
      
      // AI/ML
      { owner: 'openai', repo: 'openai-python' },
      { owner: 'langchain-ai', repo: 'langchain' },
      { owner: 'huggingface', repo: 'transformers' },
      
      // Cloud/DevOps
      { owner: 'kubernetes', repo: 'kubernetes' },
      { owner: 'docker', repo: 'compose' },
      { owner: 'hashicorp', repo: 'terraform' },
      
      // Automation
      { owner: 'n8n-io', repo: 'n8n' },
      
      // Security
      { owner: 'OWASP', repo: 'Top10' }
    ];

    const allEvents = [];

    // Collect releases
    for (const { owner, repo } of repositories) {
      console.log(`[GitHub] Fetching ${owner}/${repo}...`);
      const releases = await this.fetchReleases(owner, repo);
      allEvents.push(...releases);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Collect security advisories
    console.log('[GitHub] Fetching security advisories...');
    const advisories = await this.fetchSecurityAdvisories();
    allEvents.push(...advisories);

    console.log(`[GitHub] Collected ${allEvents.length} events`);
    return allEvents;
  }
}

export default new GitHubCollector();
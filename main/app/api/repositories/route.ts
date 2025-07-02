
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch popular repositories from GitHub API
    const response = await fetch('https://api.github.com/search/repositories?q=stars:>10000&sort=stars&order=desc&per_page=20', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories from GitHub: ${response.statusText}`);
    }

    const data = await response.json();

    // Map GitHub API response to our Repository interface
    const repositories = data.items.map((repo: any) => ({
      id: repo.id.toString(),
      name: repo.name,
      owner: repo.owner.login,
      language: repo.language || 'N/A',
      stars: repo.stargazers_count,
      description: repo.description || 'No description available.',
      url: repo.html_url,
      last_activity: repo.updated_at,
    }));

    return NextResponse.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * GitHub Storage - Free alternative to Vercel Blob
 * Stores content as JSON files in your GitHub repository
 */

// Content repository configuration - can be overridden with environment variables
const GITHUB_REPO = process.env.CONTENT_GITHUB_REPO || 'zscore-content'; // Content repo name
const GITHUB_OWNER = process.env.CONTENT_GITHUB_OWNER || 'zscorenotes'; // GitHub username/org
const CONTENT_BRANCH = 'main'; // Branch to store content
const CONTENT_DIR = ''; // Content files are in root of content repository

/**
 * Get GitHub token from environment variables
 */
function getGitHubToken() {
  return process.env.GITHUB_TOKEN;
}

/**
 * Read a content file from GitHub
 */
export async function readContentFile(filename) {
  try {
    const token = getGitHubToken();
    if (!token) {
      console.error('❌ No GitHub token found for content loading');
      return null;
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_DIR ? CONTENT_DIR + '/' : ''}${filename}`;
    
    console.log('🔍 GitHub API Request:', {
      url,
      repo: GITHUB_REPO,
      owner: GITHUB_OWNER,
      filename,
      hasToken: !!token
    });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 404) {
      console.warn(`📄 File not found: ${filename} in ${GITHUB_OWNER}/${GITHUB_REPO}`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText
      });
      throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    
    return {
      content: JSON.parse(content),
      sha: data.sha, // Needed for updates
    };
  } catch (error) {
    console.error(`Error reading ${filename} from GitHub:`, error);
    return null;
  }
}

/**
 * Write a content file to GitHub
 */
export async function writeContentFile(filename, data, sha = null) {
  try {
    const token = getGitHubToken();
    if (!token) {
      throw new Error('GitHub token required for writing content');
    }

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${CONTENT_DIR ? CONTENT_DIR + '/' : ''}${filename}`;
    
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    
    const payload = {
      message: `Update ${filename} - ${new Date().toISOString()}`,
      content: content,
      branch: CONTENT_BRANCH,
    };

    // Include SHA for updates (required to overwrite existing files)
    if (sha) {
      payload.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
    }

    const result = await response.json();
    return result.content.sha; // Return new SHA for future updates
  } catch (error) {
    console.error(`Error writing ${filename} to GitHub:`, error);
    throw error;
  }
}

/**
 * Store file metadata (SHA values) in memory for efficient updates
 */
const fileMetadata = new Map();

/**
 * Get all content using GitHub storage
 */
export async function getAllContentFromGitHub() {
  const contentTypes = ['news', 'services', 'portfolio', 'about', 'settings', 'categories'];
  const content = {};

  for (const contentType of contentTypes) {
    const filename = `${contentType}.json`;
    const result = await readContentFile(filename);
    
    if (result) {
      content[contentType] = result.content;
      fileMetadata.set(filename, result.sha);
    } else {
      // Provide empty defaults
      if (['news', 'services', 'portfolio'].includes(contentType)) {
        content[contentType] = [];
      } else if (contentType === 'categories') {
        content[contentType] = {
          services: [],
          portfolio: [],
          news: [],
          updated_at: new Date().toISOString()
        };
      } else {
        content[contentType] = { updated_at: new Date().toISOString() };
      }
    }
  }

  return content;
}

/**
 * Save content type to GitHub
 */
export async function saveContentToGitHub(contentType, data) {
  const filename = `${contentType}.json`;
  const currentSha = fileMetadata.get(filename);
  
  try {
    const newSha = await writeContentFile(filename, data, currentSha);
    fileMetadata.set(filename, newSha);
    return true;
  } catch (error) {
    console.error(`Failed to save ${contentType} to GitHub:`, error);
    return false;
  }
}
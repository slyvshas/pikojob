import { supabase } from '../lib/supabase.js';

const GITHUB_REPO = 'enescingoz/awesome-n8n-templates';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

// Helper function to convert title to URL-friendly slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim('-'); // Remove leading/trailing hyphens
};

// Helper function to extract workflow metadata from markdown content
const parseWorkflowFromMarkdown = (content, filePath) => {
  const lines = content.split('\n');
  const workflows = [];
  let currentWorkflow = null;
  let inWorkflow = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a workflow entry (starts with - [ ])
    if (line.match(/^-\s*\[.*\]\(.*\)/)) {
      if (currentWorkflow) {
        workflows.push(currentWorkflow);
      }
      
      // Extract title and URL from markdown link
      const linkMatch = line.match(/^-\s*\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, title, url] = linkMatch;
        currentWorkflow = {
          title: title.trim(),
          source_url: url.trim(),
          slug: createSlug(title.trim()),
          description: '',
          tools_used: [],
          category_id: null,
          trigger_type: null,
          difficulty_level: 'intermediate',
          json_storage_path: null,
        };
        inWorkflow = true;
      }
    } else if (inWorkflow && currentWorkflow && line && !line.startsWith('#')) {
      // Add description if it's not empty and not a header
      if (currentWorkflow.description) {
        currentWorkflow.description += ' ' + line;
      } else {
        currentWorkflow.description = line;
      }
    } else if (line.startsWith('#') && currentWorkflow) {
      // New section, finish current workflow
      if (currentWorkflow) {
        workflows.push(currentWorkflow);
        currentWorkflow = null;
        inWorkflow = false;
      }
    }
  }
  
  // Add the last workflow if exists
  if (currentWorkflow) {
    workflows.push(currentWorkflow);
  }

  return workflows;
};

// Function to determine category from file path or content
const determineCategoryFromPath = async (filePath, content) => {
  const pathLower = filePath.toLowerCase();
  const contentLower = content.toLowerCase();
  
  // Get categories from Supabase
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug');
  
  if (!categories) return null;
  
  // Map file paths and content to categories
  const categoryMap = {
    'data': ['data-processing'],
    'marketing': ['marketing-crm'],
    'social': ['social-media'],
    'ecommerce': ['ecommerce'],
    'communication': ['communication'],
    'finance': ['finance-accounting'],
    'project': ['project-management'],
    'development': ['development-it'],
    'ai': ['ai-ml'],
    'ml': ['ai-ml'],
    'content': ['content-management'],
    'utility': ['utilities'],
    'integration': ['integration'],
  };
  
  for (const [keyword, slugs] of Object.entries(categoryMap)) {
    if (pathLower.includes(keyword) || contentLower.includes(keyword)) {
      const category = categories.find(cat => slugs.includes(cat.slug));
      if (category) return category.id;
    }
  }
  
  // Default to utilities category
  const utilityCategory = categories.find(cat => cat.slug === 'utilities');
  return utilityCategory?.id || null;
};

// Function to extract tools from workflow content
const extractTools = (content, jsonContent = '') => {
  const tools = new Set();
  const combinedContent = (content + ' ' + jsonContent).toLowerCase();
  
  // Common n8n nodes/tools
  const commonTools = [
    'webhook', 'http request', 'gmail', 'google sheets', 'slack', 'discord',
    'twitter', 'facebook', 'instagram', 'linkedin', 'dropbox', 'google drive',
    'notion', 'airtable', 'mysql', 'postgresql', 'mongodb', 'redis',
    'elasticsearch', 'salesforce', 'hubspot', 'mailchimp', 'sendgrid',
    'stripe', 'paypal', 'aws', 'azure', 'github', 'gitlab', 'jira',
    'trello', 'asana', 'monday', 'clickup', 'telegram', 'whatsapp',
    'zoom', 'microsoft teams', 'shopify', 'woocommerce', 'wordpress',
    'calendly', 'typeform', 'google calendar', 'outlook', 'twilio',
    'vonage', 'openai', 'anthropic', 'google ai', 'aws s3', 'ftp'
  ];
  
  commonTools.forEach(tool => {
    if (combinedContent.includes(tool)) {
      // Capitalize first letter of each word
      const formattedTool = tool
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      tools.add(formattedTool);
    }
  });
  
  return Array.from(tools);
};

// Function to download and store workflow JSON
const downloadAndStoreJson = async (workflow, jsonUrl) => {
  try {
    // Fetch JSON content from GitHub
    const response = await fetch(jsonUrl);
    if (!response.ok) return null;
    
    const jsonContent = await response.text();
    
    // Validate JSON
    try {
      JSON.parse(jsonContent);
    } catch (e) {
      console.error(`Invalid JSON for workflow ${workflow.title}:`, e);
      return null;
    }
    
    // Store in Supabase storage
    const fileName = `${workflow.slug}.json`;
    const categorySlug = workflow.categories?.slug || 'uncategorized';
    const filePath = `${categorySlug}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('workflow-json')
      .upload(filePath, jsonContent, {
        contentType: 'application/json',
        upsert: true
      });
    
    if (uploadError) {
      console.error(`Error uploading JSON for ${workflow.title}:`, uploadError);
      return null;
    }
    
    return filePath;
  } catch (error) {
    console.error(`Error processing JSON for ${workflow.title}:`, error);
    return null;
  }
};

// Main function to fetch repository contents
const fetchRepoContents = async (path = '') => {
  const url = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${path}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching repo contents for path ${path}:`, error);
    return [];
  }
};

// Function to fetch markdown content
const fetchMarkdownContent = async (filePath) => {
  const url = `${GITHUB_RAW_BASE}/${GITHUB_REPO}/main/${filePath}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    return await response.text();
  } catch (error) {
    console.error(`Error fetching markdown content for ${filePath}:`, error);
    return null;
  }
};

// Main ingestion function
export const ingestWorkflowsFromGitHub = async (onProgress = null) => {
  try {
    console.log('Starting workflow ingestion from GitHub...');
    
    let processedCount = 0;
    let totalWorkflows = 0;
    
    // Fetch repository structure
    const contents = await fetchRepoContents();
    if (!contents.length) {
      throw new Error('No contents found in repository');
    }
    
    const allWorkflows = [];
    
    // Process each file in the repository
    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md') && item.name !== 'README.md') {
        console.log(`Processing ${item.name}...`);
        
        const content = await fetchMarkdownContent(item.path);
        if (!content) continue;
        
        const workflows = parseWorkflowFromMarkdown(content, item.path);
        
        for (const workflow of workflows) {
          // Determine category
          workflow.category_id = await determineCategoryFromPath(item.path, content);
          
          // Extract tools
          workflow.tools_used = extractTools(content);
          
          // Try to download JSON if URL points to a JSON file
          if (workflow.source_url && workflow.source_url.endsWith('.json')) {
            workflow.json_storage_path = await downloadAndStoreJson(workflow, workflow.source_url);
          }
          
          allWorkflows.push(workflow);
        }
      }
    }
    
    totalWorkflows = allWorkflows.length;
    console.log(`Found ${totalWorkflows} workflows to process`);
    
    // Insert workflows into Supabase
    for (const workflow of allWorkflows) {
      try {
        // Check if workflow already exists
        const { data: existing } = await supabase
          .from('workflows')
          .select('id')
          .eq('slug', workflow.slug)
          .single();
        
        if (existing) {
          // Update existing workflow
          const { error } = await supabase
            .from('workflows')
            .update(workflow)
            .eq('slug', workflow.slug);
          
          if (error) {
            console.error(`Error updating workflow ${workflow.title}:`, error);
          } else {
            console.log(`Updated workflow: ${workflow.title}`);
          }
        } else {
          // Insert new workflow
          const { error } = await supabase
            .from('workflows')
            .insert(workflow);
          
          if (error) {
            console.error(`Error inserting workflow ${workflow.title}:`, error);
          } else {
            console.log(`Inserted workflow: ${workflow.title}`);
          }
        }
        
        processedCount++;
        
        if (onProgress) {
          onProgress({
            processed: processedCount,
            total: totalWorkflows,
            current: workflow.title
          });
        }
      } catch (error) {
        console.error(`Error processing workflow ${workflow.title}:`, error);
      }
    }
    
    console.log(`Ingestion completed. Processed ${processedCount}/${totalWorkflows} workflows`);
    
    return {
      success: true,
      processed: processedCount,
      total: totalWorkflows,
      message: `Successfully processed ${processedCount} workflows`
    };
    
  } catch (error) {
    console.error('Error during workflow ingestion:', error);
    return {
      success: false,
      error: error.message,
      message: `Ingestion failed: ${error.message}`
    };
  }
};

// Function to manually trigger ingestion (for admin use)
export const triggerWorkflowIngestion = async () => {
  return new Promise((resolve) => {
    ingestWorkflowsFromGitHub((progress) => {
      console.log(`Progress: ${progress.processed}/${progress.total} - ${progress.current}`);
    }).then(resolve);
  });
};
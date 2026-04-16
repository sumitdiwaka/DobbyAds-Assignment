import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
  headers: { Authorization: `Bearer ${process.env.AUTH_TOKEN}` }
});

const server = new McpServer({
  name: 'dobby-ads-mcp',
  version: '1.0.0',
  description: 'MCP server for Dobby Ads file manager — create folders, upload images, and list content',
});

// TOOL 1: List folders
server.tool(
  'list_folders',
  'List all folders in a directory. Leave parentId empty to list root folders.',
  { parentId: z.string().optional().describe('Parent folder ID (omit for root)') },
  async ({ parentId }) => {
    const { data } = await api.get(`/folders?parent=${parentId || 'null'}`);
    const text = data.length === 0
      ? 'No folders found.'
      : data.map(f => `📁 ${f.name} (ID: ${f._id}, Size: ${f.totalSize} bytes)`).join('\n');
    return { content: [{ type: 'text', text }] };
  }
);

// TOOL 2: Create folder
server.tool(
  'create_folder',
  'Create a new folder. Optionally specify a parent folder ID to nest it.',
  {
    name: z.string().describe('Name of the folder to create'),
    parentId: z.string().optional().describe('Parent folder ID (omit for root)'),
  },
  async ({ name, parentId }) => {
    const { data } = await api.post('/folders', { name, parent: parentId || null });
    return {
      content: [{
        type: 'text',
        text: `✅ Folder "${data.name}" created successfully! ID: ${data._id}`
      }]
    };
  }
);

// TOOL 3: List images in a folder
server.tool(
  'list_images',
  'List all images inside a specific folder.',
  { folderId: z.string().describe('The folder ID to list images from') },
  async ({ folderId }) => {
    const { data } = await api.get(`/images?folder=${folderId}`);
    const text = data.length === 0
      ? 'No images in this folder.'
      : data.map(img => `🖼️ ${img.name} (${img.originalName}, ${img.size} bytes)`).join('\n');
    return { content: [{ type: 'text', text }] };
  }
);

// TOOL 4: Get folder info + breadcrumb
server.tool(
  'get_folder_info',
  'Get details about a folder including its size and navigation breadcrumb.',
  { folderId: z.string().describe('The folder ID') },
  async ({ folderId }) => {
    const { data } = await api.get(`/folders/${folderId}`);
    const breadcrumb = data.breadcrumb?.map(b => b.name).join(' > ') || data.name;
    const text = `📁 Folder: ${data.name}\nPath: ${breadcrumb}\nTotal Size: ${data.totalSize} bytes\nID: ${data._id}`;
    return { content: [{ type: 'text', text }] };
  }
);

// TOOL 5: Find folder by name
server.tool(
  'find_folder_by_name',
  'Search for a folder by name under a given parent (or root).',
  {
    name: z.string().describe('Name of the folder to find'),
    parentId: z.string().optional().describe('Parent folder ID to search in'),
  },
  async ({ name, parentId }) => {
    const { data } = await api.get(`/folders?parent=${parentId || 'null'}`);
    const match = data.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (!match) return { content: [{ type: 'text', text: `No folder named "${name}" found.` }] };
    return { content: [{ type: 'text', text: `Found: 📁 ${match.name} (ID: ${match._id}, Size: ${match.totalSize} bytes)` }] };
  }
);

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🚀 Dobby Ads MCP server running via stdio');
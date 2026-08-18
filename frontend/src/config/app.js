/**
 * Central application configuration.
 *
 * All branding / product strings are read from Vite environment variables
 * (see frontend/.env.example) so the template can be re-skinned without
 * touching source code. Sensible generic fallbacks are provided.
 */

const env = import.meta.env || {};

const str = (value, fallback) =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const name = str(env.VITE_APP_NAME, 'Nexus');
const key = str(
  env.VITE_APP_KEY,
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
);

export const app = {
  name,
  key,
  tagline: str(env.VITE_APP_TAGLINE, 'Intelligent RAG Assistant'),
  description: str(
    env.VITE_APP_DESCRIPTION,
    'An intelligent RAG assistant over your documents.',
  ),
  initials: str(
    env.VITE_APP_INITIALS,
    name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(),
  ),
  assistantName: str(env.VITE_APP_ASSISTANT, name),
  storage: {
    conversations: `${key}.conversations.v1`,
    uploads: `${key}.uploads.v1`,
    sidebar: `${key}.sidebar.collapsed`,
  },
  welcome: {
    title: `Welcome to ${name}`,
    message: `Hello! I am ${name}, your grounded AI assistant. I answer using only the knowledge base you upload — no invented facts. Try asking me anything, or start by uploading a document from the admin console.`,
  },
};
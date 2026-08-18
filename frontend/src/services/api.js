const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${API_URL}/api`;
const AUTH_BASE = `${API_URL}/auth`;

export async function login(username, password) {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  
  const data = await res.json();
  localStorage.setItem('adminToken', data.token);
  return data;
}

export function isAuthenticated() {
  return !!localStorage.getItem('adminToken');
}

export function logout() {
  localStorage.removeItem('adminToken');
}

export async function searchDocuments(query, topK = 5) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: query, top_k: topK }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Search failed');
  }

  const data = await res.json();
  return data.message || [];
}

export async function streamChat(query, history, onChunk, onError, onDone) {
  try {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        chat_history: history,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Chat request failed');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.choices && data.choices.length > 0 && data.choices[0].delta.content) {
              onChunk(data.choices[0].delta.content);
            }
          } catch (e) {
            console.error("Error parsing SSE data line", line, e);
          }
        }
      }
    }
    
    if (onDone) onDone();
  } catch (err) {
    if (onError) onError(err);
  }
}

export async function uploadDocument(text) {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text }),
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }
  return res.json();
}

export async function uploadFileDocument(file) {
  const token = localStorage.getItem('adminToken');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'File upload failed');
  }
  return res.json();
}

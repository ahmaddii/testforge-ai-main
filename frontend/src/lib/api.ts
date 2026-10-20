import { supabase } from "./supabase";

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': session ? `Bearer ${session.access_token}` : '',
  };
}

export const api = {
  async get(endpoint: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        throw errorData;
      } catch {
        throw new Error(text);
      }
    }
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        throw errorData;
      } catch {
        throw new Error(text);
      }
    }
    return res.json();
  },

  async patch(endpoint: string, data: any) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        throw errorData;
      } catch {
        throw new Error(text);
      }
    }
    return res.json();
  },

  async delete(endpoint: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        throw errorData;
      } catch {
        throw new Error(text);
      }
    }
    return res;
  }
};

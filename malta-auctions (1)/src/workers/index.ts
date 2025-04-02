import { AuctionDatabase } from '../models/database';
import { AuctionAsset } from '../models/types';

/**
 * Cloudflare Worker for MaltaGovAuctions
 */
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const db = new AuctionDatabase(env.DB);
    
    // Handle API requests
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest(request, url, db);
    }
    
    // Serve static assets
    return fetch(request);
  },
};

/**
 * Handle API requests
 */
async function handleApiRequest(request: Request, url: URL, db: AuctionDatabase): Promise<Response> {
  // Get all assets
  if (url.pathname === '/api/assets') {
    const assets = await db.getAllAssets();
    return new Response(JSON.stringify(assets), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get assets by type
  if (url.pathname.startsWith('/api/assets/type/')) {
    const type = url.pathname.split('/').pop() as AuctionAsset['type'];
    if (!['real_estate', 'vessel', 'currency', 'vehicle'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid asset type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const assets = await db.getAssetsByType(type);
    return new Response(JSON.stringify(assets), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Get assets by sanctions status
  if (url.pathname === '/api/assets/sanctions') {
    const compliant = url.searchParams.get('compliant') === 'true';
    const assets = await db.getAssetsBySanctionsStatus(compliant);
    return new Response(JSON.stringify(assets), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Handle POST request to add new asset
  if (url.pathname === '/api/assets' && request.method === 'POST') {
    try {
      const asset = await request.json() as AuctionAsset;
      const id = await db.insertAsset(asset);
      return new Response(JSON.stringify({ id, success: true }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid asset data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Default 404 response
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

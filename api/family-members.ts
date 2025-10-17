import { sql } from '@vercel/postgres';
import { initializeDatabase } from './db';

export default async function handler(req: Request) {
  // データベースの初期化
  await initializeDatabase();
  const url = new URL(req.url);
  const method = req.method;

  // CORS ヘッダー
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // OPTIONS リクエストの処理
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetFamilyMembers(corsHeaders);
      
      case 'POST':
        const body = await req.json();
        return await handleCreateFamilyMember(body, corsHeaders);
      
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleGetFamilyMembers(corsHeaders: Record<string, string>) {
  try {
    const { rows } = await sql`
      SELECT id, name, color, created_at
      FROM family_members
      ORDER BY created_at ASC
    `;

    return new Response(JSON.stringify({ familyMembers: rows }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get family members:', error);
    return new Response(JSON.stringify({ error: 'Failed to get family members' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleCreateFamilyMember(memberData: any, corsHeaders: Record<string, string>) {
  try {
    const { id, name, color } = memberData;

    const { rows } = await sql`
      INSERT INTO family_members (id, name, color)
      VALUES (${id}, ${name}, ${color})
      RETURNING *
    `;

    return new Response(JSON.stringify({ familyMember: rows[0] }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create family member:', error);
    return new Response(JSON.stringify({ error: 'Failed to create family member' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
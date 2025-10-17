import { sql } from '@vercel/postgres';
import { initializeDatabase, FamilyMember } from './db';

// GET: 家族メンバー一覧を取得
export async function GET() {
  try {
    await initializeDatabase();
    
    const result = await sql`
      SELECT id, name, color, created_at as "createdAt"
      FROM family_members 
      ORDER BY created_at ASC
    `;

    return new Response(JSON.stringify({ familyMembers: result.rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch family members' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: 新しい家族メンバーを追加
export async function POST(request: Request) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { id, name, color } = body;

    if (!id || !name || !color) {
      return new Response(JSON.stringify({ error: 'Missing required fields: id, name, color' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 既存のIDをチェック
    const existingMember = await sql`
      SELECT id FROM family_members WHERE id = ${id}
    `;

    if (existingMember.rows.length > 0) {
      return new Response(JSON.stringify({ error: 'Family member with this ID already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      INSERT INTO family_members (id, name, color)
      VALUES (${id}, ${name}, ${color})
      RETURNING id, name, color, created_at as "createdAt"
    `;

    return new Response(JSON.stringify({ familyMember: result.rows[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    return new Response(JSON.stringify({ error: 'Failed to create family member' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT: 家族メンバー情報を更新
export async function PUT(request: Request) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { id, name, color } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Family member ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      UPDATE family_members 
      SET name = COALESCE(${name}, name),
          color = COALESCE(${color}, color)
      WHERE id = ${id}
      RETURNING id, name, color, created_at as "createdAt"
    `;

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Family member not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ familyMember: result.rows[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    return new Response(JSON.stringify({ error: 'Failed to update family member' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE: 家族メンバーを削除
export async function DELETE(request: Request) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Family member ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 関連するTODOも削除するかチェック
    const relatedTodos = await sql`
      SELECT COUNT(*) as count FROM todos WHERE assigned_to = (
        SELECT name FROM family_members WHERE id = ${id}
      )
    `;

    if (relatedTodos.rows[0].count > 0) {
      return new Response(JSON.stringify({ 
        error: 'Cannot delete family member with existing todos. Please reassign or delete todos first.' 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      DELETE FROM family_members 
      WHERE id = ${id}
      RETURNING id, name, color
    `;

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Family member not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Family member deleted successfully',
      deletedMember: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete family member' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

import { sql } from '@vercel/postgres';
import { initializeDatabase, Todo } from './db';

// GET: すべてのTODOを取得
export async function GET() {
  try {
    await initializeDatabase();
    
    const result = await sql`
      SELECT id, title, completed, assigned_to as "assignedTo", 
             assigned_to_color as "assignedToColor", due_date as "dueDate", 
             priority, category, created_at as "createdAt", updated_at as "updatedAt"
      FROM todos 
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({ todos: result.rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch todos' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: 新しいTODOを作成
export async function POST(request: Request) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { title, assignedTo, assignedToColor, priority = 'normal', dueDate, category } = body;

    if (!title || !assignedTo || !assignedToColor) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = Date.now().toString();
    
    const result = await sql`
      INSERT INTO todos (id, title, completed, assigned_to, assigned_to_color, due_date, priority, category)
      VALUES (${id}, ${title}, FALSE, ${assignedTo}, ${assignedToColor}, ${dueDate || null}, ${priority}, ${category || null})
      RETURNING id, title, completed, assigned_to as "assignedTo", 
                assigned_to_color as "assignedToColor", due_date as "dueDate", 
                priority, category, created_at as "createdAt", updated_at as "updatedAt"
    `;

    return new Response(JSON.stringify({ todo: result.rows[0] }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    return new Response(JSON.stringify({ error: 'Failed to create todo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PUT: TODOを更新
export async function PUT(request: Request) {
  try {
    await initializeDatabase();
    
    const body = await request.json();
    const { id, title, completed, assignedTo, assignedToColor, priority, dueDate, category } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Todo ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      UPDATE todos 
      SET title = COALESCE(${title}, title),
          completed = COALESCE(${completed}, completed),
          assigned_to = COALESCE(${assignedTo}, assigned_to),
          assigned_to_color = COALESCE(${assignedToColor}, assigned_to_color),
          priority = COALESCE(${priority}, priority),
          due_date = ${dueDate || null},
          category = ${category || null},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, completed, assigned_to as "assignedTo", 
                assigned_to_color as "assignedToColor", due_date as "dueDate", 
                priority, category, created_at as "createdAt", updated_at as "updatedAt"
    `;

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Todo not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ todo: result.rows[0] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    return new Response(JSON.stringify({ error: 'Failed to update todo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE: TODOを削除
export async function DELETE(request: Request) {
  try {
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Todo ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await sql`
      DELETE FROM todos 
      WHERE id = ${id}
      RETURNING id, title
    `;

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Todo not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Todo deleted successfully',
      deletedTodo: result.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete todo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

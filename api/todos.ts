import { sql } from '@vercel/postgres';
import { initializeDatabase } from './db';

// データベースの初期化
await initializeDatabase();

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const method = req.method;
  const pathname = url.pathname;

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
        return await handleGetTodos(corsHeaders);
      
      case 'POST':
        const body = await req.json();
        return await handleCreateTodo(body, corsHeaders);
      
      case 'PUT':
        const todoId = pathname.split('/').pop();
        const updateData = await req.json();
        return await handleUpdateTodo(todoId!, updateData, corsHeaders);
      
      case 'DELETE':
        const deleteId = pathname.split('/').pop();
        return await handleDeleteTodo(deleteId!, corsHeaders);
      
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

async function handleGetTodos(corsHeaders: Record<string, string>) {
  try {
    const { rows } = await sql`
      SELECT 
        id,
        title,
        completed,
        assigned_to,
        assigned_to_color,
        priority,
        due_date,
        category,
        created_at,
        updated_at
      FROM todos
      ORDER BY created_at DESC
    `;

    return new Response(JSON.stringify({ todos: rows }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get todos:', error);
    return new Response(JSON.stringify({ error: 'Failed to get todos' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleCreateTodo(todoData: any, corsHeaders: Record<string, string>) {
  try {
    const { title, assignedTo, assignedToColor, priority = 'normal', dueDate, category } = todoData;
    const id = Date.now().toString();

    const { rows } = await sql`
      INSERT INTO todos (
        id, title, assigned_to, assigned_to_color, 
        priority, due_date, category
      )
      VALUES (
        ${id}, ${title}, ${assignedTo}, 
        ${assignedToColor}, ${priority}, 
        ${dueDate || null}, ${category || null}
      )
      RETURNING *
    `;

    return new Response(JSON.stringify({ todo: rows[0] }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return new Response(JSON.stringify({ error: 'Failed to create todo' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleUpdateTodo(id: string, updates: any, corsHeaders: Record<string, string>) {
  try {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.completed !== undefined) {
      updateFields.push(`completed = $${values.length + 1}`);
      values.push(updates.completed);
    }

    if (updates.priority !== undefined) {
      updateFields.push(`priority = $${values.length + 1}`);
      values.push(updates.priority);
    }

    if (updateFields.length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const query = `
      UPDATE todos 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    values.push(id);

    const { rows } = await sql.query(query, values);

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: `Todo with id ${id} not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ todo: rows[0] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to update todo:', error);
    return new Response(JSON.stringify({ error: 'Failed to update todo' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleDeleteTodo(id: string, corsHeaders: Record<string, string>) {
  try {
    const { rowCount } = await sql`
      DELETE FROM todos WHERE id = ${id}
    `;

    if (rowCount === 0) {
      return new Response(JSON.stringify({ error: `Todo with id ${id} not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete todo' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

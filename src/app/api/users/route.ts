import { NextRequest, NextResponse } from 'next/server';

// シミュレートされたユーザーデータ（実際のプロジェクトではデータベースを使用）
const users = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Charlie',
    email: 'charlie@example.com',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  // サーバーサイドでの処理をシミュレート（例：データベースクエリ）
  await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms待機

  const timestamp = new Date().toISOString();

  return NextResponse.json({
    users,
    serverInfo: {
      timestamp,
      environment: process.env.NODE_ENV,
      serverLocation: 'Cloud Run',
      processingTime: '500ms',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // サーバーサイドでの処理をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newUser = {
      id: users.length + 1,
      name,
      email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return NextResponse.json(
      {
        user: newUser,
        message: 'User created successfully',
        serverInfo: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

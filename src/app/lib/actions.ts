'use server';

import { revalidatePath } from 'next/cache';

export interface ServerActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export async function processFormData(
  formData: FormData
): Promise<ServerActionResult> {
  // フォームデータの取得
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as string;

  // バリデーション
  if (!title || !description) {
    return {
      success: false,
      message: 'タイトルと説明は必須です',
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // サーバーサイド処理をシミュレート（例：データベース保存、外部API呼び出し等）
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機

    // ここで実際のビジネスロジックを実行
    const processedData = {
      id: Math.floor(Math.random() * 10000),
      title,
      description,
      priority,
      createdAt: new Date().toISOString(),
      processedBy: 'Cloud Run Server',
      environment: process.env.NODE_ENV || 'development',
    };

    // キャッシュの再検証（必要に応じて）
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'データが正常に処理されました',
      data: processedData,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error processing form data:', error);
    return {
      success: false,
      message: 'サーバーエラーが発生しました',
      timestamp: new Date().toISOString(),
    };
  }
}

export async function generateReport(): Promise<ServerActionResult> {
  try {
    // 重い処理をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2秒待機

    const report = {
      id: `report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      stats: {
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        activeUsers: Math.floor(Math.random() * 500) + 50,
        systemLoad: (Math.random() * 100).toFixed(2) + '%',
        uptime: Math.floor(Math.random() * 168) + 1 + ' hours',
      },
      serverInfo: {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        location: 'Google Cloud Run',
      },
    };

    return {
      success: true,
      message: 'レポートが正常に生成されました',
      data: report,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      message: 'レポート生成中にエラーが発生しました',
      timestamp: new Date().toISOString(),
    };
  }
}

'use client';

import { useState, useTransition } from 'react';
import {
  processFormData,
  generateReport,
  ServerActionResult,
} from '../lib/actions';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  serverInfo: {
    timestamp: string;
    environment: string;
    serverLocation: string;
    processingTime: string;
  };
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [serverInfo, setServerInfo] = useState<
    UsersResponse['serverInfo'] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState<ServerActionResult | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const [addingUser, setAddingUser] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setServerInfo(data.serverInfo);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await processFormData(formData);
      setActionResult(result);
    });
  };

  const handleGenerateReport = async () => {
    startTransition(async () => {
      const result = await generateReport();
      setActionResult(result);
    });
  };

  const handleAddUser = async (formData: FormData) => {
    const name = formData.get('userName') as string;
    const email = formData.get('userEmail') as string;

    if (!name || !email) {
      setActionResult({
        success: false,
        message: '名前とメールアドレスは必須です',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setAddingUser(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      const result = await response.json();

      if (response.ok) {
        setActionResult({
          success: true,
          message: result.message,
          data: result.user,
          timestamp: new Date().toISOString(),
        });
        // ユーザー一覧を更新
        await fetchUsers();
        // フォームを閉じる
        setShowAddForm(false);
      } else {
        setActionResult({
          success: false,
          message: result.error || 'ユーザー追加に失敗しました',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setActionResult({
        success: false,
        message: 'ネットワークエラーが発生しました',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAddingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Cloud Run サーバーサイド処理テスト
        </h1>

        {/* サーバー情報セクション */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">サーバー情報</h2>
          {serverInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>タイムスタンプ:</strong>{' '}
                  {new Date(serverInfo.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>環境:</strong> {serverInfo.environment}
                </p>
              </div>
              <div>
                <p>
                  <strong>サーバー場所:</strong> {serverInfo.serverLocation}
                </p>
                <p>
                  <strong>処理時間:</strong> {serverInfo.processingTime}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              サーバー情報を取得するには「ユーザー一覧を取得」をクリックしてください
            </p>
          )}
        </div>

        {/* API Route テストセクション */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Route テスト</h2>

          <div className="flex gap-4 mb-4">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md"
            >
              {loading ? '読み込み中...' : 'ユーザー一覧を取得'}
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              {showAddForm ? 'フォームを閉じる' : 'ユーザーを追加'}
            </button>
          </div>

          {/* ユーザー追加フォーム */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-medium mb-3">新しいユーザーを追加</h3>
              <form action={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="userName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      名前
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="例: 田中太郎"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="userEmail"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      id="userEmail"
                      name="userEmail"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="例: tanaka@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addingUser}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md"
                >
                  {addingUser ? '追加中...' : 'ユーザーを追加'}
                </button>
              </form>
            </div>
          )}

          {users.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">
                ユーザー一覧 ({users.length}件)
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メール
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        作成日時
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {users.length === 0 && serverInfo && (
            <p className="text-gray-500 text-center py-8">
              ユーザーが見つかりませんでした。「ユーザーを追加」ボタンから新しいユーザーを追加してください。
            </p>
          )}
        </div>

        {/* Server Actions テストセクション */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Server Actions テスト</h2>

          <form action={handleFormSubmit} className="space-y-4 mb-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                タイトル
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                説明
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                優先度
              </label>
              <select
                id="priority"
                name="priority"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-md"
            >
              {isPending ? '処理中...' : 'データを送信'}
            </button>
          </form>

          <button
            onClick={handleGenerateReport}
            disabled={isPending}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-md"
          >
            {isPending ? '生成中...' : 'レポートを生成'}
          </button>
        </div>

        {/* 結果表示セクション */}
        {actionResult && (
          <div
            className={`rounded-lg shadow-md p-6 ${
              actionResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              {actionResult.success ? '✅ 成功' : '❌ エラー'}
            </h2>
            <p className="mb-2">
              <strong>メッセージ:</strong> {actionResult.message}
            </p>
            <p className="mb-4">
              <strong>タイムスタンプ:</strong>{' '}
              {new Date(actionResult.timestamp).toLocaleString()}
            </p>

            {actionResult.data && (
              <div>
                <h3 className="font-semibold mb-2">処理結果:</h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(actionResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

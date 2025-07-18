import Link from 'next/link';

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Link
        href="/dashboard"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Cloud Run サーバーサイド処理のテストを確認 →
      </Link>
    </div>
  );
}

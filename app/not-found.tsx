import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="library-page">
      <h1>没有找到这一页</h1>
      <Link className="primary-button" href="/">
        返回目录
      </Link>
    </main>
  );
}

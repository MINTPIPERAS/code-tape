import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-2xl">404</p>
      <p className="text-sm text-muted">这个页面不在录制里。</p>
      <Link to="/" className="text-xs text-muted underline underline-offset-2">
        返回库
      </Link>
    </div>
  );
}

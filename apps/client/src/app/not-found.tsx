import Link from "next/link";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className="absolute top-0 right-0 bottom-0 left-0 flex flex-col items-center justify-center gap-3">
        <div className={styles.code} aria-label="404">
          <p>404</p>
        </div>
        <h1>页面走丢了</h1>
        <p>你访问的页面不存在、已被删除，或链接输入有误。</p>
        <Link
          href="/"
          className="rounded-xl bg-(--theme-color) px-5 py-3 caret-green-300 shadow-lg transition hover:bg-(--select-color) hover:shadow-xl"
        >
          返回首页
        </Link>
      </div>
    </section>
  );
}

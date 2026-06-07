import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="mb-3 text-sm font-semibold text-emerald-300">404</p>

      <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
        {t("title")}
      </h1>

      <p className="mb-8 max-w-xl text-base leading-7 text-gray-300">
        {t("description")}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-emerald-200"
        >
          {t("home")}
        </Link>

        <Link
          href="/posts"
          className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-emerald-300 hover:text-emerald-200"
        >
          {t("posts")}
        </Link>
      </div>
    </section>
  );
}

"use client";

import { AnimatedList } from "@/components/ReactBits/animated-list/animated-list";
import type { Post } from "@/data/mock-posts";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Modules from "./posts.module.scss";

type PostsListClientProps = {
  posts: Post[];
};

function formatPostDate(dateString: number) {
  const date = new Date(dateString);

  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(date.getDate()).padStart(2, "0")}`;
}

export default function PostsListClient({ posts }: PostsListClientProps) {
  const router = useRouter();

  const handleItemSelect = useCallback(
    (post: Post) => {
      console.log("Selected:", post.title);

      // 导航到文章详情页 / Navigate to post detail page
      router.push(`/posts/${post.id}`);
    },
    [router],
  );

  const renderPost = useCallback((post: Post) => {
    const formattedDate = formatPostDate(post.created_at);

    return (
      <div className="flex w-full flex-col gap-3">
        <h3 className="m-0 text-xl font-bold text-white">{post.title}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className={Modules.label}>
            <span className="icon-[mynaui--clock-four]" />
            <span>{formattedDate}</span>
          </span>

          <span className={Modules.label}>
            <span className="icon-[mynaui--hash-circle] h-4 w-3" />
            <span>{post.category}</span>
          </span>

          <span className={Modules.label}>
            <span className="icon-[mynaui--eye]" />
            <span>{post.views}</span>
          </span>
        </div>
      </div>
    );
  }, []);

  return (
    <section className={Modules["posts-section"]}>
      <AnimatedList
        items={posts}
        onItemSelect={handleItemSelect}
        renderItem={renderPost}
        showGradients={false}
        enableArrowNavigation={false}
        displayScrollbar={false}
        itemHeight="100px"
        className={Modules["animated-list"]}
      />
    </section>
  );
}

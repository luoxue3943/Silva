"use client";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "../../styles/navbar.scss";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isActive = (pName: string) => {
    if (pathname === pName) return true;
    else return false;
  };

  useEffect(() => {
    const scrollThreshold = window.innerHeight / 5;
    const handleScroll = () => setIsScrolled(window.scrollY > scrollThreshold);

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <div className="navbar">
        {/* 首页 */}
        <Link href="/" className="link-button">
          <div className={`title ${isActive("/") ? "active" : ""}`}>
            <span
              className={`icon-[mynaui--home] ${isActive("/") ? "" : "hidden"}`}
            />
            <span>首页</span>
          </div>
        </Link>
        {/* 文稿 */}
        <Link href="/posts" className="link-button">
          <div className={`title ${isActive("/posts") ? "active" : ""}`}>
            <span
              className={`icon-[mynaui--file-text] ${isActive("/posts") ? "" : "hidden"}`}
            />
            <span>文稿</span>
          </div>
        </Link>
        {/* 留言 */}
        <Link href="/messages" className="link-button">
          <div className={`title ${isActive("/messages") ? "active" : ""}`}>
            <span
              className={`icon-[mynaui--message-dots] ${isActive("/messages") ? "" : "hidden"}`}
            />
            <span>留言</span>
          </div>
        </Link>
        {/* 更多 */}
        <Link href="/more" className="link-button">
          <div className={`title ${isActive("/more") ? "active" : ""}`}>
            <span
              className={`icon-[mynaui--dots-circle] ${isActive("/more") ? "" : "hidden"}`}
            />
            <span>更多</span>
          </div>
        </Link>
      </div>
    </header>
  );
}

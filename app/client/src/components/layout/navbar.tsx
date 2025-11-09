"use client";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "../../styles/navbar.scss";

interface NavbarProps {
  labels: {
    home: string;
    posts: string;
    timeline: string;
    messages: string;
    more: string;
  };
}

export default function Navbar({ labels }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isActive = (pName: string) => pathname === pName;

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
              className={`nav-icon icon-[mynaui--home] ${isActive("/") ? "" : "hidden"}`}
            />
            <span className="nav-text" data-page="home">
              {labels.home}
            </span>
          </div>
        </Link>

        {/* 文稿 */}
        <Link href="/posts" className="link-button">
          <div className={`title ${isActive("/posts") ? "active" : ""}`}>
            <span
              className={`nav-icon icon-[mynaui--file-text] ${isActive("/posts") ? "" : "hidden"}`}
            />
            <span className="nav-text" data-page="posts">
              {labels.posts}
            </span>
          </div>
        </Link>

        {/* 时间轴 */}
        <Link href="/timeline" className="link-button">
          <div className={`title ${isActive("/timeline") ? "active" : ""}`}>
            <span
              className={`nav-icon icon-[meteor-icons--clock-rotate] ${isActive("/timeline") ? "" : "hidden"}`}
            />
            <span className="nav-text" data-page="timeline">
              {labels.timeline}
            </span>
          </div>
        </Link>

        {/* 留言 */}
        <Link href="/messages" className="link-button">
          <div className={`title ${isActive("/messages") ? "active" : ""}`}>
            <span
              className={`nav-icon icon-[mynaui--message-dots] ${isActive("/messages") ? "" : "hidden"}`}
            />
            <span className="nav-text" data-page="messages">
              {labels.messages}
            </span>
          </div>
        </Link>

        {/* 更多 */}
        <Link href="/more" className="link-button">
          <div className={`title ${isActive("/more") ? "active" : ""}`}>
            <span
              className={`nav-icon icon-[mynaui--dots-circle] ${isActive("/more") ? "" : "hidden"}`}
            />
            <span className="nav-text" data-page="more">
              {labels.more}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

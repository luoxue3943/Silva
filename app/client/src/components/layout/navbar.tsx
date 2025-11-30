import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import Modules from "../../style/navbar.module.scss";
import * as m from "~/paraglide/messages";

export default component$(() => {
  const loc = useLocation();
  const isScrolled = useSignal(false);

  const isActive = (pName: string) => loc.url.pathname === pName;
  const isStartWith = (pName: string) => loc.url.pathname.startsWith(pName);

  useVisibleTask$(() => {
    const scrollThreshold = window.innerHeight / 5;

    const handleScroll = () => {
      isScrolled.value = window.scrollY > scrollThreshold;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return (
    <nav>
      <div class={Modules.navbar}>
        <Link href="/" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${isActive("/") ? Modules.active : ""}`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--home] ${
                isActive("/") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="home">
              {m["Navbar.home"]()}
            </span>
          </div>
        </Link>

        <Link href="/posts" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isStartWith("/posts") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--file-text] ${
                isStartWith("/posts") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="posts">
              {m["Navbar.posts"]()}
            </span>
          </div>
        </Link>

        <Link href="/timeline" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isStartWith("/timeline") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[meteor-icons--clock-rotate] ${
                isStartWith("/timeline") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="timeline">
              {m["Navbar.timeline"]()}
            </span>
          </div>
        </Link>

        <Link href="/messages" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isActive("/messages") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--message-dots] ${
                isActive("/messages") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="messages">
              {m["Navbar.messages"]()}
            </span>
          </div>
        </Link>

        <Link href="/more" class={Modules["link-button"]}>
          <div
            class={`${Modules.title} ${
              isStartWith("/more") ? Modules.active : ""
            }`}
          >
            <span
              class={`${Modules["nav-icon"]} icon-[mynaui--dots-circle] ${
                isStartWith("/more") ? "" : "hidden"
              }`}
            />
            <span class={Modules["nav-text"]} data-page="more">
              {m["Navbar.more"]()}
            </span>
          </div>
        </Link>
      </div>
    </nav>
  );
});

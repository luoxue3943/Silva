import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import * as m from "~/paraglide/messages";
import { getLocale } from "~/paraglide/runtime";
import { SilvaConfig } from "../lib/config-loader";
import Modules from "../style/home.module.scss";

export default component$(() => {
  const locale = getLocale();

  const langCode = locale.split("-")[0];
  const siteOwnerName =
    SilvaConfig.site[`name_${langCode}`] ?? SilvaConfig.site.name;

  const splitToSpans = (text: string, className = "", delay = 0) =>
    Array.from(text).map((char, i) => (
      <span
        key={i}
        class={`${Modules["pop-up"]} ${Modules["delay-" + (i + delay)]} ${className}`}
      >
        {char}
      </span>
    ));

  const welcome = m["HomePage.welcome"]();
  const owner = siteOwnerName;
  const totalLength = (welcome + owner).length;

  return (
    <>
      <div class="flex">
        <div class={Modules.profile}>
          <img
            src="profile.jpg"
            alt="Profile Picture"
            class="m-auto rounded-full"
            width={300}
            height={300}
            loading="lazy"
          />
        </div>

        <div class={`${Modules.headline} text-4xl`}>
          <div class="mx-auto h-fit">
            {splitToSpans(welcome)}

            <span class="inline px-3 font-bold">
              {splitToSpans(owner, "", welcome.length)}
            </span>

            {["👋", "."].map((char, i) => (
              <span
                key={char}
                class={`${Modules["pop-up"]} ${
                  Modules["delay-" + (totalLength + i)]
                }`}
              >
                {char}
              </span>
            ))}
          </div>
          <div class="mx-auto flex h-fit w-fit gap-3.5 text-xl">
            <div
              class={`${Modules.icon} bg-black ${Modules["pop-up"]} ${Modules["delay-16"]}`}
            >
              <span class={`icon-[line-md--twitter-x]`} />
            </div>
            <div
              class={`${Modules.icon} bg-black ${Modules["pop-up"]} ${Modules["delay-17"]}`}
            >
              <span class={`icon-[line-md--github]`} />
            </div>
            <div
              class={`${Modules.icon} bg-[#EA4335] ${Modules["pop-up"]} ${Modules["delay-18"]}`}
            >
              <span class={`icon-[line-md--email]`} />
            </div>
            <div
              class={`${Modules.icon} bg-[#0088CC] ${Modules["pop-up"]} ${Modules["delay-19"]}`}
            >
              <span class="icon-[line-md--telegram]" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};

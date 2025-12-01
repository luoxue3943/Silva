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

        <div class={`${Modules.headline} h-fit text-4xl`}>
          <div class="ml-14 h-fit">
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

import {
  renderToStream,
  type RenderToStreamOptions,
} from "@builder.io/qwik/server";
import Root from "./root";

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    // Use container attributes to set attributes on the html tag.
    containerAttributes: {
      lang: "zh-cn",
      class: "transition",
      ...opts.containerAttributes,
    },
    serverData: {
      ...opts.serverData,
    },
  });
}

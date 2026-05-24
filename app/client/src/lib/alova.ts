import { resolveMockApi } from "@/data/mock-api";
import { createAlova, type AlovaRequestAdapter } from "alova";

const MOCK_BASE_URL = "http://silva.mock";
const MOCK_DELAY_MS = 260;

function delay(ms: number) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

const mockRequestAdapter: AlovaRequestAdapter<unknown, Response, Headers> = (
  elements,
) => {
  let aborted = false;
  let responsePromise: Promise<Response> | undefined;

  const buildResponse = async () => {
    if (!responsePromise) {
      responsePromise = (async () => {
        await delay(MOCK_DELAY_MS);

        if (aborted) {
          throw new Error("Mock request aborted");
        }

        const requestUrl = new URL(elements.url, MOCK_BASE_URL);
        const result = resolveMockApi(requestUrl);

        return new Response(JSON.stringify(result.body), {
          status: result.status ?? 200,
          headers: {
            "content-type": "application/json",
          },
        });
      })();
    }

    return responsePromise;
  };

  return {
    response: buildResponse,
    headers: async () => (await buildResponse()).headers,
    abort: () => {
      aborted = true;
    },
  };
};

export const silvaAlova = createAlova({
  baseURL: MOCK_BASE_URL,
  requestAdapter: mockRequestAdapter,
  cacheFor: {
    GET: 0,
  },
  responded: async (response) => {
    const data = await response.json();

    if (!response.ok) {
      const errorData = data as { message?: unknown };

      throw new Error(
        typeof errorData.message === "string"
          ? errorData.message
          : "Mock request failed",
      );
    }

    return data;
  },
});

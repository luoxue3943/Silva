import { resolveMockApi } from "@/data/mock-api";
import { createAlova, type AlovaRequestAdapter } from "alova";

/**
 * alova 客户端配置 / alova client configuration
 *
 * 通过本地 mock 适配器模拟接口延迟、响应和错误处理。
 * Uses a local mock adapter to simulate API latency, responses, and error handling.
 */

const MOCK_BASE_URL = "http://silva.mock";
const MOCK_DELAY_MS = 260;

/**
 * 等待指定毫秒数 / Waits for the given number of milliseconds.
 */
function delay(ms: number) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

/**
 * 本地 mock 请求适配器 / Local mock request adapter
 *
 * 将 alova 请求解析到内存数据集，并复用同一次请求的响应 Promise。
 * Resolves alova requests against in-memory datasets and reuses the response promise per request.
 */
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

/**
 * Silva API 客户端实例 / Silva API client instance
 */
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

      // 将 mock 错误响应标准化为 Error / Normalizes mock error responses into Error.
      throw new Error(
        typeof errorData.message === "string"
          ? errorData.message
          : "Mock request failed",
      );
    }

    return data;
  },
});

import { createAlova } from "alova";
import adapterFetch from "alova/fetch";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

/**
 * API 响应统一包裹结构 / Unified API response envelope.
 */
type ApiEnvelope<T> = {
  code: number;
  data: T;
  message?: string;
};

/**
 * Silva API 客户端实例 / Silva API client instance.
 *
 * 统一解析后端响应包裹结构，并把错误响应转换为 Error。
 * Parses backend response envelopes and converts error responses into Error.
 */
export const silvaAlova = createAlova({
  baseURL: API_BASE_URL,
  requestAdapter: adapterFetch(),
  cacheFor: {
    GET: 0,
  },
  responded: async (response) => {
    const envelope = (await response.json()) as ApiEnvelope<unknown>;

    // HTTP 层错误直接透出后端消息 / HTTP-level errors expose the backend message directly.
    if (!response.ok) {
      throw new Error(envelope.message ?? "API request failed");
    }

    // 业务层错误同样标准化为 Error / Business-level errors are also normalized into Error.
    if (envelope.code !== 0) {
      throw new Error(envelope.message ?? "API request failed");
    }

    return envelope.data;
  },
});

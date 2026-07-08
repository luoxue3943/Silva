import { ofetch } from "ofetch";

/**
 * API 响应统一包装结构
 */
type ApiEnvelope<T> = {
  code: number;
  data: T;
  message?: string;
};

/**
 * Silva API 客户端实例
 *
 * 统一解析后端响应包装结构，并把错误响应转换为 Error。
 */
export const silvaFetch = ofetch.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,

  credentials: "include",
  retry: 0,

  onResponse({ response }) {
    const envelope = response._data as ApiEnvelope<unknown>;

    if (envelope.code !== 0) {
      throw new Error(envelope.message ?? "API request failed");
    }

    response._data = envelope.data;
  },

  onResponseError({ response }) {
    const envelope = response._data as
      Partial<ApiEnvelope<unknown>> | undefined;

    throw new Error(envelope?.message ?? "API request failed");
  },
});

import { silvaAlova } from "@/lib/alova";
import type { PaginationResponse } from "@/types/pagination";
import type { Murmur } from "@/types/murmur";

const MURMURS_PAGE_SIZE = 15;

export function getMurmurs(page: number, pageSize = MURMURS_PAGE_SIZE) {
  return silvaAlova.Get<PaginationResponse<Murmur>>("/murmurs", {
    params: {
      page,
      pageSize,
    },
  });
}

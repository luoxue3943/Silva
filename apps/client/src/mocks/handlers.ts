import { delay, http, HttpResponse } from "msw";

export const handlers = [
  http.get("*/api/v1/stats/total-stats", async () => {
    await delay(500);

    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        totalVisits: 12860,
        onlineUsers: 12,
      },
    });
  }),

  http.post("*/api/v1/stats/visit", () => {
    return HttpResponse.json({
      code: 0,
      message: "访问记录成功",
      data: 12861,
    });
  }),
];

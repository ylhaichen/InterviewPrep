import { describe, expect, it } from "vitest";

import { parseJsonArray } from "@/lib/utils/json";

describe("json utils", () => {
  it("parses arrays safely", () => {
    expect(parseJsonArray('["VLA","World Model"]')).toEqual(["VLA", "World Model"]);
    expect(parseJsonArray("invalid")).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { transformExpressUrlParamsToOpenAPI } from "../src/utils/Transformations";
describe("Utils", () => {
  it("Test url transformation util", () => {
    expect(transformExpressUrlParamsToOpenAPI("/admin/users/:id")).toEqual("/admin/users/{id}");
    expect(transformExpressUrlParamsToOpenAPI("/admin/users/:id/check")).toEqual("/admin/users/{id}/check");
    expect(transformExpressUrlParamsToOpenAPI("/admin/users/:id/check/:baz")).toEqual("/admin/users/{id}/check/{baz}");
    expect(transformExpressUrlParamsToOpenAPI("/admin/users/:id/check/:baz/hai")).toEqual("/admin/users/{id}/check/{baz}/hai");
  });
});

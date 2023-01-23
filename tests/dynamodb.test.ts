import { expect, it, vi } from "vitest";
import DynamoDB from "../src/lib/AWS/DynamoDB";

it("should work", async () => {
  vi.mock(
    "@aws-sdk/client-dynamodb",
    vi.fn(async () => {
      const actual: any = await vi.importActual("@aws-sdk/client-dynamodb");
      return {
        ...actual,
        DynamoDBClient: vi.fn(),
      };
    })
  );
  vi.mock(
    "@aws-sdk/lib-dynamodb",
    vi.fn(() => ({
      DynamoDBDocumentClient: {
        from: vi.fn(
          vi.fn(() => {
            return {
              send: vi.fn(() => {
                return {
                  Items: [],
                };
              }),
            };
          })
        ),
      },
    }))
  );

  expect(await DynamoDB.scan("StatusInfo")).toEqual([]); // Baseline test
});

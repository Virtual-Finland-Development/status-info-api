import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DynamoDB from "../src/services/AWS/DynamoDB";
const mockItems: any = [];

describe("DynamoDB", () => {
  beforeEach(() => {
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
      vi.fn(async () => {
        const clientActual: any = await vi.importActual("@aws-sdk/client-dynamodb");
        return {
          DynamoDBDocumentClient: {
            from: vi.fn(
              vi.fn(() => {
                return {
                  send: vi.fn((action) => {
                    if (action instanceof clientActual.GetItemCommand) {
                      const index = mockItems.findIndex((item: any) => item.id.S === action.input.Key.id.S);
                      if (index > -1) {
                        return {
                          Item: mockItems[index],
                        };
                      }
                      return {
                        Item: undefined,
                      };
                    }
                    if (action instanceof clientActual.PutItemCommand) {
                      mockItems.push(action.input.Item);
                      return;
                    }
                    if (action instanceof clientActual.UpdateItemCommand) {
                      const index = mockItems.findIndex((item: any) => item.id.S === action.input.Key.id.S);
                      if (index > -1) {
                        const update: any = {};
                        for (const key in action.input.ExpressionAttributeValues) {
                          const parsedKey = key.replace(":", "");
                          const keyType = Object.keys(action.input.ExpressionAttributeValues[key])[0];
                          const keyValue = Object.values(action.input.ExpressionAttributeValues[key])[0];
                          update[parsedKey] = {};
                          update[parsedKey][keyType] = keyValue;
                        }

                        mockItems[index] = {
                          ...mockItems[index],
                          ...update,
                        };
                      }
                      return;
                    }
                    if (action instanceof clientActual.DeleteItemCommand) {
                      const index = mockItems.findIndex((item: any) => item.id.S === action.input.Key.id.S);
                      if (index > -1) {
                        mockItems.splice(index, 1);
                      }
                      return;
                    }
                    if (action instanceof clientActual.ScanCommand) {
                      return {
                        Items: mockItems,
                      };
                    }
                    console.log(action);
                    throw new Error("Unknown action");
                  }),
                };
              })
            ),
          },
        };
      })
    );
  });

  afterEach(() => {
    mockItems.length = 0;
    vi.clearAllMocks();
  });

  it("Create Read Update Delete", async () => {
    expect(await DynamoDB.scan("StatusInfo")).toEqual([]); // Baseline test

    // Create
    const item = await DynamoDB.putItem("StatusInfo", { userId: "123", statusName: "Test", statusValue: "SENT" });
    expect(item.id).toBeDefined();
    expect(item.statusName).toBe("Test");
    expect(item.statusValue).toBe("SENT");

    // Read
    const readItem = await DynamoDB.getItem("StatusInfo", { id: item.id });
    expect(readItem?.id).toBe(item.id);
    expect(readItem?.statusName).toBe(item.statusName);
    expect(readItem?.statusValue).toBe(item.statusValue);

    // Update
    await DynamoDB.updateItem("StatusInfo", { id: item.id, statusValue: "READY" });
    const updateItem = await DynamoDB.getItem("StatusInfo", { id: item.id });
    expect(updateItem?.id).toBe(item.id);
    expect(updateItem?.statusName).toBe(item.statusName);
    expect(updateItem?.statusValue).toBe("READY");

    // Delete
    await DynamoDB.deleteItem("StatusInfo", { id: item.id });
    expect(await DynamoDB.getItem("StatusInfo", { id: item.id })).toBeNull();
  });
});

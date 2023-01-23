import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DynamoDB from "../src/lib/AWS/DynamoDB";
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
                      const index = mockItems.findIndex((item: any) => item.Id.S === action.input.Key.Id.S);
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
                      const index = mockItems.findIndex((item: any) => item.Id.S === action.input.Key.Id.S);
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
                      const index = mockItems.findIndex((item: any) => item.Id.S === action.input.Key.Id.S);
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
    const item = await DynamoDB.putItem("StatusInfo", { StatusName: "Test", StatusValue: "In Progress" });
    expect(item.Id).toBeDefined();
    expect(item.StatusName).toBe("Test");
    expect(item.StatusValue).toBe("In Progress");

    // Read
    const readItem = await DynamoDB.getItem("StatusInfo", { Id: item.Id });
    expect(readItem?.Id).toBe(item.Id);
    expect(readItem?.StatusName).toBe(item.StatusName);
    expect(readItem?.StatusValue).toBe(item.StatusValue);

    // Update
    await DynamoDB.updateItem("StatusInfo", { Id: item.Id, StatusValue: "Complete" });
    const updateItem = await DynamoDB.getItem("StatusInfo", { Id: item.Id });
    expect(updateItem?.Id).toBe(item.Id);
    expect(updateItem?.StatusName).toBe(item.StatusName);
    expect(updateItem?.StatusValue).toBe("Complete");

    // Delete
    await DynamoDB.deleteItem("StatusInfo", { Id: item.Id });
    expect(await DynamoDB.getItem("StatusInfo", { Id: item.Id })).toBeNull();
  });
});

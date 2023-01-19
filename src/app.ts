import { getDynamoDBItem } from "./lib/AWS/DynamoDB";

export const handler = async (event: any = {}): Promise<any> => {
  const moro = await getDynamoDBItem("moro", "moro");
  console.log(moro);
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "OK",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
  return response;
};

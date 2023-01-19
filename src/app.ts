import serverlessExpress from "@vendia/serverless-express";
import app from "./api/router";
export const handler = serverlessExpress({ app });

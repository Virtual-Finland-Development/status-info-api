export enum HttpMethods {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  TRACE = "TRACE",
  CONNECT = "CONNECT",
}

export type HttpMethod = keyof typeof HttpMethods;

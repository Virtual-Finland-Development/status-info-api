export function ensureObject(obj: any) {
  if (isObject(obj)) {
    return {};
  }
  return obj;
}

export function isObject(bob: any): boolean {
  return typeof bob === "object" && bob !== null;
}

export function cloneItem(item: any): any {
  return JSON.parse(JSON.stringify(item));
}

export function getEnumValues(enumObj: any): string[] {
  if (!isObject(enumObj)) {
    throw new Error("Expected an enum-object");
  }
  return Object.keys(enumObj).filter((item) => {
    return isNaN(Number(item));
  });
}

export function trimSlashes(str: string): string {
  return str.replace(/^\/?|\/?$/g, "");
}

/**
 *
 * @param url
 * @returns
 */
export function transformExpressUrlParamsToOpenAPI(url: string): string {
  if (url.includes("/:")) {
    url = url.replace(/:(\w+)\//gi, "{$1}/"); // replace: url/:id/action => url/{id}/action
    url = url.replace(/:(\w+)$/gi, "{$1}"); // replace: url/:id => url/{id}
  }
  return url;
}

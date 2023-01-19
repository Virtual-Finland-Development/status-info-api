export default function router(event: any) {
  const { path, httpMethod } = event;
  const pathParts = path.split("/");
  const resource = pathParts[1];
  const id = pathParts[2];
  const method = httpMethod.toLowerCase();
  const controller = require(`./controllers/${resource}`);
}

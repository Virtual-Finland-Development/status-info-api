import { DocumentBuilder } from "express-openapi-generator";
import { OpenAPIV3 } from "openapi-types";

// Operations handle
const operationsStore: Record<string, Record<string, OpenAPIV3.OperationObject>> = {};

// Documentation object
let documentationStore: any;

// Generate documentation
const documentationBuilder = DocumentBuilder.initializeDocument({
  openapi: "3.0.1",
  info: {
    title: "Statusinfo API",
    version: "1",
    description: "API for Statusinfo",
    contact: {
      name: "Virtual Finland",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  paths: {},
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
});

/**
 *
 * @param routerApp
 * @returns
 */
function initialize(routerApp: any) {
  documentationBuilder.generatePathsObject(routerApp);
  documentationStore = documentationBuilder.build();

  // Merge operation docs if any
  for (const path in operationsStore) {
    for (const method in operationsStore[path]) {
      if (typeof documentationStore.paths[path] !== "undefined") {
        documentationStore.paths[path][method] = {
          ...documentationStore.paths[path][method],
          ...operationsStore[path][method],
        };
      }
    }
  }
  return documentationStore;
}

/**
 *
 * @param method
 * @param path
 * @param openapi
 */
function addOperationDoc(method: string, path: string, openapi: OpenAPIV3.OperationObject) {
  if (typeof operationsStore[path] === "undefined") {
    operationsStore[path] = {};
  }
  operationsStore[path][method] = openapi;
}

/**
 *
 * @param name
 * @param schema
 */
function addSchema(name: string, schema: OpenAPIV3.SchemaObject) {
  documentationBuilder.schema(name, { component: schema });
}

/**
 *
 * @param schemaName
 * @param attributeName
 * @returns
 */
function getSchema(schemaName: string, attributeName?: string): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
  const schemaRef = documentationBuilder.schema(schemaName);
  if (!schemaRef) {
    throw new Error(`Schema ${schemaName} not initialized`);
  }

  if (attributeName) {
    const schema = documentationBuilder.schema(schemaName, { copy: true }) as OpenAPIV3.SchemaObject;
    if (typeof schema.properties === "undefined") {
      throw new Error(`Schema ${schemaName} does not have properties`);
    }
    const attributeSchema = schema.properties[attributeName];
    if (!attributeSchema) {
      throw new Error(`Schema ${schemaName} does not have attribute ${attributeName}`);
    }
    return attributeSchema;
  }

  return schemaRef;
}

/**
 *
 * @returns
 */
function asObject() {
  if (!documentationStore) {
    throw new Error("Documentation has not been generated yet");
  }
  return documentationStore;
}

/**
 *
 * @param openApiDocUrl
 * @returns
 */
function getSwaggerHtml(openApiDocUrl: string) {
  if (!documentationStore) {
    throw new Error("Documentation has not been generated yet");
  }
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta
    name="description"
    content="SwaggerUI"
  />
  <title>SwaggerUI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js" crossorigin></script>
<script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: '${openApiDocUrl}',
      dom_id: '#swagger-ui',
    });
  };
</script>
</body>
</html>`;
}

export default {
  initialize,
  addOperationDoc,
  addSchema,
  getSchema,
  asObject,
  getSwaggerHtml,
};

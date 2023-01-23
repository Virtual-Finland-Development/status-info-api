import { DocumentBuilder } from "express-openapi-generator";

// Generate documentation
const documentationBuilder = DocumentBuilder.initializeDocument({
  openapi: "3.0.1",
  info: {
    title: "Statusinfo API",
    version: "1",
    description: "API for Statusinfo",
    contact: {
      name: "Virtual Finland",
      email: "",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  paths: {},
});

let builtDocumentation: any;

/**
 *
 * @param routerApp
 * @returns
 */
function generateDocumentation(routerApp: any) {
  documentationBuilder.generatePathsObject(routerApp);
  builtDocumentation = documentationBuilder.build();
  return builtDocumentation;
}

export default {
  builder: documentationBuilder,
  initialize: generateDocumentation,
  asObject: () => {
    if (!builtDocumentation) {
      throw new Error("Documentation has not been generated yet");
    }
    return builtDocumentation;
  },
  getSwaggerHtml: (openApiDocUrl: string) => {
    if (!builtDocumentation) {
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
  },
};

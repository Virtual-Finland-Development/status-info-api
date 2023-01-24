import * as pulumi from "@pulumi/pulumi";
import { beforeEach, describe, expect, it } from "vitest";

// Pulumi testing mode setup
pulumi.runtime.setMocks(
  {
    newResource: function (args: pulumi.runtime.MockResourceArgs): { id: string; state: any } {
      return {
        id: args.inputs.name + "_id",
        state: args.inputs,
      };
    },
    call: function (args: pulumi.runtime.MockCallArgs) {
      return args.inputs;
    },
  },
  "Virtual Finland",
  "test",
  true,
  "virtualfinland"
);

describe("Stack setup test", () => {
  let infra: typeof import("../infra/main");

  beforeEach(async () => {
    infra = await import("../infra/main");
  });

  it("Outpus must be defined", function (done) {
    expect(infra.dynamoDBtableName).toBeDefined();
    expect(infra.url).toBeDefined();
  });
});

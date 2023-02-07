import { OpenAPIV3 } from "openapi-types";
import "reflect-metadata";

import { DynamoDBModel, KnownAutoGeneratedTypes } from "./DynamoDBORMTypes";
import { transformJSTypeToDynamoDBType } from "./DynamoDBORMUtils";

//
// Types
//
type ColumnOptions = {
  dynamodb?: {
    isPrimaryKeyType?: "HASH" | "RANGE";
    allowedValues?: string[];
    defaultValue?: any;
    autoGenerated?: {
      onEvents: string[];
      autoGenType: KnownAutoGeneratedTypes;
      autoGenFields?: string[];
      format?: string;
    };
  };
  openapi: OpenAPIV3.NonArraySchemaObject;
};

type DynamoDBGeneratorPayload = { target: typeof BaseModel.constructor; name: string; options?: ColumnOptions; type?: string };

//
// Module store
//
const DynamoDBModelGenerator: any = {
  collector: {
    collect(type: "tables" | "fields", payload: DynamoDBGeneratorPayload) {
      this.store[type].push(payload);
    },
    store: {
      tables: [] as DynamoDBGeneratorPayload[],
      fields: [] as DynamoDBGeneratorPayload[],
      models: {} as Record<string, DynamoDBModel>,
    },
    getTableMeta(target: BaseModel) {
      return this.store.tables.find((table: any) => table.target === target);
    },
    getFieldMetas(target: BaseModel) {
      return this.store.fields.filter((field: any) => field.target === target);
    },
    getFieldMeta(target: BaseModel, fieldName: string) {
      return this.getFieldMetas(target).find((field: any) => field.name === fieldName);
    },
  },
  getDynamoDBModel(target: typeof BaseModel.constructor): DynamoDBModel {
    const tableName = this.collector.getTableMeta(target).name;
    if (typeof this.collector.store.models[tableName] === "undefined") {
      this.collector.store.models[tableName] = this.generateModel(target);
    }
    return this.collector.store.models[tableName];
  },
  /**
   * @see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
   *
   * @param target
   * @returns
   */
  generateModel(target: typeof BaseModel.constructor): DynamoDBModel {
    const KeySchema = [];
    const AttributeDefinitions = [];
    const openapiProperties: Record<string, OpenAPIV3.NonArraySchemaObject> = {};

    const tableName = this.collector.getTableMeta(target).name;
    const columnDefinitions = this.collector.getFieldMetas(target);

    for (const columnDefinition of columnDefinitions) {
      const { dynamodb, openapi } = columnDefinition.options;
      const columnName = columnDefinition.name;
      // Fallback to string for unknown types as testing tool vitest does not support reflect-metadata
      const columnType = (columnDefinition.type || openapi.type || "string").toLowerCase();

      const AttributeDefinition: DynamoDBModel["schema"]["AttributeDefinitions"][0] = {
        AttributeName: columnName,
        AttributeType: transformJSTypeToDynamoDBType(columnType),
      };

      if (dynamodb) {
        const { isPrimaryKeyType, autoGenerated, allowedValues, defaultValue } = dynamodb;

        if (isPrimaryKeyType) {
          KeySchema.push({
            AttributeName: columnName,
            KeyType: isPrimaryKeyType,
          });
        }

        if (allowedValues) {
          AttributeDefinition._AllowedValues = allowedValues;
        }

        if (defaultValue) {
          AttributeDefinition._DefaultValue = defaultValue;
        }

        if (autoGenerated) {
          AttributeDefinition._AutoGenerated = autoGenerated;
        }
      }

      if (!openapi.type) {
        openapi.type = columnType;
      }
      openapiProperties[columnName] = openapi;
      AttributeDefinitions.push(AttributeDefinition);
    }

    if (KeySchema.length === 0) {
      throw new Error(`Model ${tableName} must have at least one primary key`);
    }
    if (KeySchema.length > 2) {
      throw new Error(`Model ${tableName} must have at most two primary keys`);
    }

    return {
      tableName: tableName,
      schema: {
        KeySchema: KeySchema,
        AttributeDefinitions: AttributeDefinitions,
      },
      openapi: {
        properties: openapiProperties,
      },
    };
  },
};

//
// Model attachements, decorators
//
export class BaseModel {
  getDynamoDBModel() {
    return DynamoDBModelGenerator.getDynamoDBModel(this.constructor);
  }
}

export function Table(modelName: string): ClassDecorator {
  return function (target: any) {
    DynamoDBModelGenerator.collector.collect("tables", {
      target: target,
      name: modelName,
    });
  };
}

export function Column(options: ColumnOptions): PropertyDecorator {
  return function (prototype: Object, propertyKey: string | symbol) {
    const reflectType = Reflect.getMetadata("design:type", prototype, propertyKey);
    DynamoDBModelGenerator.collector.collect("fields", {
      target: prototype.constructor,
      name: propertyKey,
      options: options,
      type: reflectType?.name?.toString(),
    });
  };
}

import { OpenAPIV3 } from "openapi-types";
import "reflect-metadata";

import { KnownAutoGeneratedTypes } from "./DynamoDBORMTypes";
import { transformJSTypeToDynamoDBType } from "./DynamoDBORMUtils";

//
// Module store
//
const tableMetaStore: any = {
  tables: [],
  fields: [],
  getTableMeta(target: any) {
    return this.tables.find((table: any) => table.target === target);
  },
  getFieldMetas(target: any) {
    return this.fields.filter((field: any) => field.target === target);
  },
  getFieldMeta(target: any, fieldName: string) {
    return this.getFieldMetas(target).find((field: any) => field.name === fieldName);
  },
};

//
// Types
//
export type ColumnOptions = {
  name?: string;
  isPrimaryKeyType?: "HASH" | "RANGE";
  allowedValues?: string[];
  defaultValue?: any;
  autoGenerated?: {
    onEvents: string[];
    autoGenType: KnownAutoGeneratedTypes;
    autoGenFields?: string[];
    format?: string;
  };
  openapi: OpenAPIV3.NonArraySchemaObject;
};

export class BaseModel {
  // @see: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.NamingRulesDataTypes.html
  getDynamoDBModel() {
    const KeySchema = [];
    const AttributeDefinitions = [];
    const openapiProperties: Record<string, OpenAPIV3.NonArraySchemaObject> = {};

    const tableName = tableMetaStore.getTableMeta(this.constructor).name;
    const columnDefinitions = tableMetaStore.getFieldMetas(this.constructor);

    for (const columnDefinition of columnDefinitions) {
      const { isPrimaryKeyType, autoGenerated, allowedValues, defaultValue, openapi } = columnDefinition.options;
      const columnName = columnDefinition.name;
      const columnType = columnDefinition.type;

      if (isPrimaryKeyType) {
        KeySchema.push({
          AttributeName: columnName,
          KeyType: isPrimaryKeyType,
        });
      }

      const AttributeDefinition: any = {
        AttributeName: columnName,
        AttributeType: transformJSTypeToDynamoDBType(columnType), // Translate to dynamodb type
      };

      if (allowedValues) {
        AttributeDefinition._AllowedValues = allowedValues;
      }
      if (defaultValue) {
        AttributeDefinition._DefaultValue = defaultValue;
      }
      if (autoGenerated) {
        AttributeDefinition._AutoGenerated = autoGenerated;
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
  }
}

//
// Decorators
//
export function Table(modelName: string): ClassDecorator {
  return function (target: any) {
    tableMetaStore.tables.push({
      target: target,
      name: modelName,
    });
  };
}

export function Column(options: ColumnOptions): PropertyDecorator {
  return function (prototype: Object, propertyKey: string | symbol) {
    const reflectType = Reflect.getMetadata("design:type", prototype, propertyKey);
    tableMetaStore.fields.push({
      target: prototype.constructor,
      name: propertyKey,
      options: options,
      type: reflectType.name.toString(),
    });
  };
}

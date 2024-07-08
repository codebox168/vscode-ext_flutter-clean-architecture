import * as changeCase from "change-case";

export function getDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);

  let methods = '';

  for (let methodName of methodsName) {
    methods += `
	${changeCase.pascalCase(methodName)}(${changeCase.camelCase(methodName)}Dto *request_dtos.${changeCase.pascalCase(methodName)}Dto) (*response_dtos.${changeCase.pascalCase(methodName)}Dto, error)
`;
  }

  return `package datasources

import (
	"errors"

	"${changeCase.snakeCase(datasourceName)}.service.com/src/domain/request_dtos"
	"${changeCase.snakeCase(datasourceName)}.service.com/src/domain/response_dtos"
)

type I${pascalCaseDatasourceName}Datasource interface {
${methods}
}
`;
}

export function getDatasourceImplTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  let methods = '';

  for (let methodName of methodsName) {
    methods += `
func (${datasourceName[0].toLowerCase()} *${pascalCaseDatasourceName}MongoDatasource) ${changeCase.pascalCase(methodName)}(${changeCase.camelCase(methodName)}Dto *request_dtos.${changeCase.pascalCase(methodName)}Dto) (*response_dtos.${changeCase.pascalCase(methodName)}Dto, error) {
	// objID, err := primitive.ObjectIDFromHex(${changeCase.camelCase(methodName)}Dto.Id)
	// if err != nil {
	// 	return nil, err
	// }

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// _, err := ${datasourceName[0].toLowerCase()}.mongoCollection.InsertOne(ctx, ${changeCase.camelCase(methodName)}Dto)
	// _, err := ${datasourceName[0].toLowerCase()}.mongoCollection.UpdateByID(ctx, ${changeCase.camelCase(methodName)}Dto.Id,bson.M{"$set": ${changeCase.camelCase(methodName)}Dto})
	// _, err := ${datasourceName[0].toLowerCase()}.mongoCollection.DeleteOne(ctx, bson.M{"_id": ${changeCase.camelCase(methodName)}Dto.Id})

	// for find you have to return &response, nil
	// var response response_dtos.${changeCase.pascalCase(methodName)}Dto
	// err := ${datasourceName[0].toLowerCase()}.mongoCollection.FindOne(ctx, bson.M{"_id": ${changeCase.camelCase(methodName)}Dto.Id}).Decode(&response)

	if err != nil {
		return nil, err
	}
	return &response_dtos.${changeCase.pascalCase(methodName)}Dto{}, nil
}
`;
  }
  return `package datasources

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"${changeCase.snakeCase(datasourceName)}.service.com/src/domain/request_dtos"
	"${changeCase.snakeCase(datasourceName)}.service.com/src/domain/response_dtos"
)

type ${pascalCaseDatasourceName}MongoDatasource struct {
	mongoCollection *mongo.Collection
}
${methods}

func New(mongoCollection *mongo.Collection) *${pascalCaseDatasourceName}MongoDatasource {
	return &${pascalCaseDatasourceName}MongoDatasource{
		mongoCollection: mongoCollection,
	}
}
`;
}

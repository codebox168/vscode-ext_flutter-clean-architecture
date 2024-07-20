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

	// for create 
	// _, err = ${datasourceName[0].toLowerCase()}.mongoCollection.InsertOne(ctx, ${changeCase.camelCase(methodName)}Dto)
	// if err != nil {
	// 	return nil, err
	// }
	// return &response_dtos.${changeCase.pascalCase(methodName)}Dto{
	//	Message:"success"
	// }, nil

	// for update 
	// _, err = ${datasourceName[0].toLowerCase()}.mongoCollection.UpdateByID(ctx,objID,bson.M{"$set": ${changeCase.camelCase(methodName)}Dto})
	// if err != nil {
	// 	return nil, err
	// }
	// return &response_dtos.${changeCase.pascalCase(methodName)}Dto{
	//	Message:"success"
	// }, nil

	// for delete 
	// _, err = ${datasourceName[0].toLowerCase()}.mongoCollection.DeleteOne(ctx, bson.M{"_id":objID})
	// if err != nil {
	// 	return nil, err
	// }
	// return &response_dtos.${changeCase.pascalCase(methodName)}Dto{
	//	Message:"success"
	// }, nil

	// for findOne you have to return &response, nil
	// var response response_dtos.${changeCase.pascalCase(methodName)}Dto
	// err = ${datasourceName[0].toLowerCase()}.mongoCollection.FindOne(ctx, bson.M{"_id":objID}).Decode(&response)
	// if err != nil {
	// 	return nil, err
	// }
	// return &response, nil

	// for find many
	// filter := bson.M{}
	// if ${changeCase.camelCase(methodName)}Dto.Name != "" {
	// 	filter["name"] = ${changeCase.camelCase(methodName)}Dto.Name
	//  filter["name"] = bson.M{"$regex": ${changeCase.camelCase(methodName)}Dto.Name, "$options": "i"}
	// }

	// if ${changeCase.camelCase(methodName)}Dto.SearchQuery != "" {
	// 	filter["$or"] = []bson.M{
	// 		{"title": bson.M{"$regex": ${changeCase.camelCase(methodName)}Dto.SearchQuery, "$options": "i"}},
	// 		{"description": bson.M{"$regex": ${changeCase.camelCase(methodName)}Dto.SearchQuery, "$options": "i"}},
	// 	}
	// }

	// // Set pagination options
	// offset := (${changeCase.camelCase(methodName)}Dto.PageNum - 1) * ${changeCase.camelCase(methodName)}Dto.PerPage
	// options := options.Find()
	// options.SetSkip(int64(offset))
	// options.SetLimit(int64(${changeCase.camelCase(methodName)}Dto.PerPage))

	// // Set sorting options
	// if ${changeCase.camelCase(methodName)}Dto.OrderBy != "" {
	// 	sortOrder := 1 // default to ascending
	// 	if ${changeCase.camelCase(methodName)}Dto.OrderType == "desc" {
	// 		sortOrder = -1
	// 	}
	// 	options.SetSort(bson.D{{Key: ${changeCase.camelCase(methodName)}Dto.OrderBy, Value: sortOrder}})
	// }


	// cursor, err := ${datasourceName[0].toLowerCase()}.mongoCollection.Find(ctx, filter, options)
	// defer cursor.Close(ctx)
	// if err != nil {
	// 	return nil, err
	// }
	// var Items []response_dtos.${changeCase.camelCase(methodName)}DtoItem
	// if err := cursor.All(ctx, &Items); err != nil {
	// 	return nil, err
	// }
	// response := response_dtos.${changeCase.camelCase(methodName)}Dto{
	// 	Data: Items,
	// }
	// return &response, nil
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

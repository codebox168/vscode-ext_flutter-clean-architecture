import * as changeCase from "change-case";

export function getGrpcServiceTemplate(grpcServiceName: string, actionsName: string[]): string {



	let methods = '';

	for (let methodName of actionsName) {
		methods += `
func (s *${changeCase.pascalCase(grpcServiceName)}GrpcService) ${changeCase.pascalCase(methodName)}(_ context.Context, req *${changeCase.pascalCase(methodName)}Request) (*${changeCase.pascalCase(methodName)}Reply, error) {
	result, err := ${changeCase.camelCase(grpcServiceName)}Repo.${changeCase.pascalCase(methodName)}(&request_dtos.${changeCase.pascalCase(methodName)}Dto{})
	if err != nil {
		return nil, err
	}
	return &${changeCase.pascalCase(methodName)}Reply{}, nil
}
  `;
	}

	return `package grpc_services

import (
	context "context"

	"${changeCase.snakeCase(grpcServiceName)}.service.com/core/utils"
	"${changeCase.snakeCase(grpcServiceName)}.service.com/src/data/datasources"
	"${changeCase.snakeCase(grpcServiceName)}.service.com/src/data/repositories_impl"
	"${changeCase.snakeCase(grpcServiceName)}.service.com/src/domain/repositories"
	"${changeCase.snakeCase(grpcServiceName)}.service.com/src/domain/request_dtos"
)

var ${changeCase.camelCase(grpcServiceName)}Collection = utils.Client.Database("mydatabase").Collection("${changeCase.camelCase(grpcServiceName)}s")
var ${changeCase.camelCase(grpcServiceName)}Datasource *datasources.${changeCase.pascalCase(grpcServiceName)}MongoDatasource = datasources.New(${changeCase.camelCase(grpcServiceName)}Collection)
var ${changeCase.camelCase(grpcServiceName)}Repo repositories.${changeCase.pascalCase(grpcServiceName)}Repository = repositories_impl.New(${changeCase.camelCase(grpcServiceName)}Datasource)

type ${changeCase.pascalCase(grpcServiceName)}GrpcService struct {
	Unimplemented${changeCase.pascalCase(grpcServiceName)}GrpcServiceServer
}

${methods}
 
`;
}
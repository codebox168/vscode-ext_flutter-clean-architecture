import * as changeCase from "change-case";

export function getRepositoryTemplate(repositoryName: string, methodsName: string[]): string {  
    let methods = '';
  
    for (let methodName of methodsName) {
      methods +=`
func (${repositoryName[0].toLowerCase()} *${changeCase.pascalCase(repositoryName)}RepositoryImpl) ${changeCase.pascalCase(methodName)}(${changeCase.camelCase(methodName)}Dto *request_dtos.${changeCase.pascalCase(methodName)}Dto) (*response_dtos.${changeCase.pascalCase(methodName)}Dto, error) {
	return ${repositoryName[0].toLowerCase()}.${changeCase.camelCase(repositoryName)}Datasource.${changeCase.pascalCase(methodName)}(${changeCase.camelCase(methodName)}Dto)
}
`;
    }
  
    return `package repositories_impl

import (
	"${changeCase.snakeCase(repositoryName)}.service.com/src/data/datasources"
	"${changeCase.snakeCase(repositoryName)}.service.com/src/domain/repositories"
	"${changeCase.snakeCase(repositoryName)}.service.com/src/domain/request_dtos"
	"${changeCase.snakeCase(repositoryName)}.service.com/src/domain/response_dtos"
)

type ${changeCase.pascalCase(repositoryName)}RepositoryImpl struct {
	${changeCase.camelCase(repositoryName)}Datasource *datasources.${changeCase.pascalCase(repositoryName)}MongoDatasource
}
${methods}

func New(${changeCase.camelCase(repositoryName)}Datasource *datasources.${changeCase.pascalCase(repositoryName)}MongoDatasource) repositories.${changeCase.pascalCase(repositoryName)}Repository {
	return &${changeCase.pascalCase(repositoryName)}RepositoryImpl{
		${changeCase.camelCase(repositoryName)}Datasource: ${changeCase.camelCase(repositoryName)}Datasource,
	}
}

`;
  }
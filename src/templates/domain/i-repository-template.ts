import * as changeCase from "change-case";

export function getIRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
  let methods = '';

  for (let methodName of methodsName) {
    methods +=` ${changeCase.pascalCase(methodName)}(${changeCase.camelCase(methodName)}Dto *request_dtos.${changeCase.pascalCase(methodName)}Dto) (*response_dtos.${changeCase.pascalCase(methodName)}Dto, error)
`;
  }

  return `package repositories

import (
	"${changeCase.snakeCase(repositoryName)}.service.com/src/domain/request_dtos"
	"${changeCase.snakeCase(repositoryName)}.service.com/src/domain/response_dtos"
)

type ${changeCase.pascalCase(repositoryName)}Repository interface {

${methods}
}
`;
}
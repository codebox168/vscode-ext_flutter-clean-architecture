import * as changeCase from "change-case";

export function getResponseDtoTemplate(responseDtoName: string): string {

  return `package response_dtos

type ${changeCase.pascalCase(responseDtoName)}Dto struct {
	Message string \`json:"message"\`
}
`;
}
import * as changeCase from "change-case";

export function getRequestDtoTemplate(requestDtoName: string): string {
    return `package request_dtos

type ${changeCase.pascalCase(requestDtoName)}Dto struct {
	AuthId     string   \`json:"auth_id" validate:"required" bson:"-"\`
	AuthRole   string   \`json:"auth_role" validate:"required" bson:"-"\`
}
`;
}
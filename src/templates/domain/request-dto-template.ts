import * as changeCase from "change-case";

export function getRequestDtoTemplate(requestDtoName: string): string {
    return `package request_dtos

type ${changeCase.pascalCase(requestDtoName)}Dto struct {
	AuthId     string   \`cookie:"-" reqHeader:"auth_id" params:"-" query:"-" json:"-" form:"-" xml:"-" validate:"required" bson:"-"\`
	AuthRole   string   \`cookie:"-" reqHeader:"auth_role" params:"-" query:"-" json:"-" form:"-" xml:"-" validate:"required" bson:"-"\`
}
`;
}
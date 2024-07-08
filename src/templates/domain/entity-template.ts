import * as changeCase from "change-case";

export function getEntityTemplate(entityName: string): string {
    return `package entities

type ${changeCase.pascalCase(entityName)}Entiry struct {
	Id string \`json:"id" bson:"_id"\`
}
`;
}
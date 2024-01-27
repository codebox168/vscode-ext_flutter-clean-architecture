import * as changeCase from "change-case";

export function getEntityTemplate(EntityName: string): string {
    return `export default interface ${changeCase.pascalCase(EntityName)}Entity {
    readonly property: string;
}
`;
}
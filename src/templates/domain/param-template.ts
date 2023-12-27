import * as changeCase from "change-case";

export function getParamTemplate(paramName: string): string {
    const pascalCaseParamName = changeCase.pascalCase(paramName);
    return `export default interface Param${pascalCaseParamName} {
    readonly property: string;
}
`;
}
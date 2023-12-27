import * as changeCase from "change-case";

export function getDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);

  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import Param${changeCase.pascalCase(methodName)} from "../../domain/params/param${changeCase.pascalCase(methodName)}";
`;
    methods += `
    ${changeCase.camelCase(methodName)}(params: Param${changeCase.pascalCase(methodName)}): Promise<Entity | Failure>;
`;
  }

  return `import { Failure } from "../../../core/errors/failure";
${imports}
export default interface I${pascalCaseDatasourceName}Datasource {
${methods}
}
`;
}

export function getDatasourceImplTemplate(datasourceName: string): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const camelCaseDatasourceName = changeCase.camelCase(datasourceName);
  return `import { Failure } from "../../../core/errors/failure";

export default class ${pascalCaseDatasourceName}DatasourceImpl implements I${pascalCaseDatasourceName}Datasource {  
    private ${camelCaseDatasourceName}Model: ${pascalCaseDatasourceName}Model;
    constructor(${camelCaseDatasourceName}Model: ${pascalCaseDatasourceName}Model) {
        this.${camelCaseDatasourceName}Model = ${camelCaseDatasourceName}Model;
    }
  
}
`;
}

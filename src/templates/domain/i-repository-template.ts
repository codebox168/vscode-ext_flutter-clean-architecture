import * as changeCase from "change-case";

export function getIRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);

  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports+=`import Param${changeCase.pascalCase(methodName)} from "../params/param.${changeCase.dotCase(methodName)}";
`;
    methods +=`
    ${changeCase.camelCase(methodName)}(params: Param${changeCase.pascalCase(methodName)}): Promise<${changeCase.pascalCase(repositoryName)}Entity | Failure>
`;
  }

  return `import { Failure } from "../../../core/errors/failure";
import ${changeCase.pascalCase(repositoryName)}Entity from "../entities/${changeCase.dotCase(repositoryName)}.entity";
${imports}

export default interface I${pascalCaseRepositoryName}Repository {
${methods}
}
`;
}
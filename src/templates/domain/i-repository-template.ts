import * as changeCase from "change-case";

export function getIRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);

  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports+=`import Param${changeCase.pascalCase(methodName)} from "../params/param${changeCase.pascalCase(methodName)}";
`;
    methods +=`
    ${changeCase.camelCase(methodName)}(params: Param${pascalCaseRepositoryName}): Promise<Entity | Failure>
`;
  }

  return `import { Failure } from "../../../core/errors/failure";
${imports}

export default interface I${pascalCaseRepositoryName}Repository {
${methods}
}
`;
}
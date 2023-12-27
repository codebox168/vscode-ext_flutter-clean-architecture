import * as changeCase from "change-case";

export function getRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
    const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);
  
    let methods = '';
    let imports = '';
  
    for (let methodName of methodsName) {
      imports+=`import Param${changeCase.pascalCase(methodName)} from "../../domain/params/param${changeCase.pascalCase(methodName)}";
`;
      methods +=`
    async ${changeCase.camelCase(methodName)}(params: Param${changeCase.pascalCase(methodName)}): Promise<Entity | Failure> {
        try {
            return await this.${changeCase.camelCase(methodName)}Datasource.${changeCase.camelCase(methodName)}(params);
        } catch (error) {
            if (error instanceof Exeception) {
                return error.toFailure();
            } else {
                return new RepositoryException("" + error).toFailure()
            }
        }
    }
`;
    }
  
    return `import { Exeception, RepositoryException } from "../../../core/errors/exception";
import { Failure } from "../../../core/errors/failure";
import I${pascalCaseRepositoryName}Repository from "../../domain/repositories/I${pascalCaseRepositoryName}Repository";
import I${pascalCaseRepositoryName}Datasource from "../datasources/I${pascalCaseRepositoryName}Datasource";
${imports}

export default class ${pascalCaseRepositoryName}Repository implements I${pascalCaseRepositoryName}Repository {
  private ${changeCase.camelCase(repositoryName)}Datasource: I${pascalCaseRepositoryName}Datasource;

  constructor(${changeCase.camelCase(repositoryName)}Datasource: I${pascalCaseRepositoryName}Datasource) {
    this.${changeCase.camelCase(repositoryName)}Datasource = ${changeCase.camelCase(repositoryName)}Datasource;
  }

  ${methods}
}
`;
  }
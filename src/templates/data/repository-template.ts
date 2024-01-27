import * as changeCase from "change-case";

export function getRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
    const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);
    const dotCaseRepositoryName = changeCase.dotCase(repositoryName);
  
    let methods = '';
    let imports = '';
  
    for (let methodName of methodsName) {
      imports+=`import Param${changeCase.pascalCase(methodName)} from "../../domain/params/param.${changeCase.dotCase(methodName)}";
`;
      methods +=`
    async ${changeCase.camelCase(methodName)}(params: Param${changeCase.pascalCase(methodName)}): Promise<${changeCase.pascalCase(repositoryName)}Entity | Failure> {
        try {
            return await this.${changeCase.camelCase(repositoryName)}Datasource.${changeCase.camelCase(methodName)}(params);
        } catch (error) {
            if (error instanceof Exception) {
                return error.toFailure();
            } else {
                return new RepositoryException("" + error).toFailure()
            }
        }
    }
`;
    }
  
    return `import { Exception, RepositoryException } from "../../../core/errors/exception";
import { Failure } from "../../../core/errors/failure";
import ${changeCase.pascalCase(repositoryName)}Entity from "../../domain/entities/${changeCase.dotCase(repositoryName)}.entity";
import I${pascalCaseRepositoryName}Repository from "../../domain/repositories/I${dotCaseRepositoryName}.repository";
import I${pascalCaseRepositoryName}Datasource from "../datasources/I${dotCaseRepositoryName}.datasource";
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
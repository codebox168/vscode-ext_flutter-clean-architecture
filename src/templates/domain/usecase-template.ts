import * as changeCase from "change-case";

export function getUsecaseTemplate(repositoryName: string, usecaseName: string): string {

  return `import { Failure } from "../../../core/errors/failure";
import Usecase from "../../../core/usecase/usecase";
import ${changeCase.pascalCase(repositoryName)}Entity from "../entities/${changeCase.dotCase(repositoryName)}.entity";
import Param${changeCase.pascalCase(usecaseName)} from "../params/param.${changeCase.dotCase(usecaseName)}";
import I${changeCase.pascalCase(repositoryName)}Repository from "../repositories/I${changeCase.dotCase(repositoryName)}.repository";
export default class ${changeCase.pascalCase(usecaseName)}Usecase implements Usecase<Param${changeCase.pascalCase(usecaseName)}, ${changeCase.pascalCase(repositoryName)}Entity>{
    private ${changeCase.camelCase(repositoryName)}Repository: I${changeCase.pascalCase(repositoryName)}Repository;
    constructor(${changeCase.camelCase(repositoryName)}Repository: I${changeCase.pascalCase(repositoryName)}Repository) {
        this.${changeCase.camelCase(repositoryName)}Repository = ${changeCase.camelCase(repositoryName)}Repository;
    }
    execute(param: Param${changeCase.pascalCase(usecaseName)}): Promise<${changeCase.pascalCase(repositoryName)}Entity | Failure> {
        return this.${changeCase.camelCase(repositoryName)}Repository.${changeCase.camelCase(usecaseName)}(param);
    }
}
`;
}
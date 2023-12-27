import * as changeCase from "change-case";

export function getUsecaseTemplate(repositoryName: string, usecaseName: string): string {

  return `import { Failure } from "../../../core/errors/failure";
import Usecase from "../../../core/usecase/usecase";
import Entity from "../entities/Entity";
import Param${changeCase.pascalCase(usecaseName)} from "../params/param${changeCase.pascalCase(usecaseName)}";
import I${changeCase.pascalCase(repositoryName)}Repository from "../repositories/I${changeCase.pascalCase(repositoryName)}Repository";
export default class ${changeCase.pascalCase(usecaseName)}Usecase implements Usecase<Entity, Param${changeCase.pascalCase(usecaseName)}>{
    private ${changeCase.camelCase(repositoryName)}Repository: I${changeCase.pascalCase(repositoryName)}Repository;
    constructor(${changeCase.camelCase(repositoryName)}Repository: I${changeCase.pascalCase(repositoryName)}Repository) {
        this.${changeCase.camelCase(repositoryName)}Repository = ${changeCase.camelCase(repositoryName)}Repository;
    }
    execute(param: Param${changeCase.pascalCase(usecaseName)}): Promise<Entity | Failure> {
        return this.${changeCase.camelCase(repositoryName)}Repository.login(param);
    }
}
`;
}
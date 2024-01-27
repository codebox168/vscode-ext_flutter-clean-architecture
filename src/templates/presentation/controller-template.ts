import * as changeCase from "change-case";

export function getControllerTemplate(controllerName: string, methodsName: string[]): string {

    let imports = '';
    let usecases = '';
    let actions = '';
  
    for (let methodName of methodsName) {
      imports+=`import Param${changeCase.pascalCase(methodName)} from "../../domain/params/param.${changeCase.dotCase(methodName)}";
import ${changeCase.pascalCase(methodName)}Usecase from "../../domain/usecases/${changeCase.dotCase(methodName)}.usecase";
`;
      usecases+=`const ${changeCase.camelCase(methodName)}Usecase: ${changeCase.pascalCase(methodName)}Usecase = new ${changeCase.pascalCase(methodName)}Usecase(${changeCase.camelCase(controllerName)}Repository);
`;
      actions +=`
export const ${changeCase.camelCase(methodName)}Action = async (params: Param${changeCase.pascalCase(methodName)}): Promise<${changeCase.pascalCase(controllerName)}Entity | Failure> => {
    return ${changeCase.camelCase(methodName)}Usecase.execute(params);
}
`;
    }
  
    return `import { Failure } from "../../../core/errors/failure";
import ${changeCase.pascalCase(controllerName)}Entity from "../../domain/entities/${changeCase.dotCase(controllerName)}.entity";
import I${changeCase.pascalCase(controllerName)}Datasource from "../../data/datasources/I${changeCase.dotCase(controllerName)}.datasource";
import I${changeCase.pascalCase(controllerName)}Repository from "../../domain/repositories/I${changeCase.dotCase(controllerName)}.repository";
import ${changeCase.pascalCase(controllerName)}Datasource from "../../data/datasources/${changeCase.dotCase(controllerName)}.datasource";
import ${changeCase.pascalCase(controllerName)}Repository from "../../data/repositories/${changeCase.dotCase(controllerName)}.repository";
${imports}import ${changeCase.pascalCase(controllerName)}Model  from "../../data/models/${changeCase.dotCase(controllerName)}.model";

const ${changeCase.camelCase(controllerName)}Datasource: I${changeCase.pascalCase(controllerName)}Datasource = new ${changeCase.pascalCase(controllerName)}Datasource(${changeCase.pascalCase(controllerName)}Model);
const ${changeCase.camelCase(controllerName)}Repository: I${changeCase.pascalCase(controllerName)}Repository = new ${changeCase.pascalCase(controllerName)}Repository(${changeCase.camelCase(controllerName)}Datasource);
${usecases}

${actions}
`;
  }
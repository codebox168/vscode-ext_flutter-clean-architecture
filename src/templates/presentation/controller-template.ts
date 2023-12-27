import * as changeCase from "change-case";

export function getControllerTemplate(controllerName: string, methodsName: string[]): string {

    let imports = '';
    let usecases = '';
    let actions = '';
  
    for (let methodName of methodsName) {
      imports+=`import Param${changeCase.pascalCase(methodName)} from "../../domain/params/param${changeCase.pascalCase(methodName)}";
import ${changeCase.pascalCase(methodName)}Usecase from "../../domain/usecases/${changeCase.camelCase(methodName)}Usecase";
`;
      usecases+=`const ${changeCase.camelCase(methodName)}Usecase: ${changeCase.pascalCase(methodName)}Usecase = new ${changeCase.pascalCase(methodName)}Usecase(${changeCase.camelCase(controllerName)}Repository);
`;
      actions +=`
export const ${changeCase.camelCase(methodName)}Action = async (params: Param${changeCase.pascalCase(methodName)}): Promise<Entity | Failure> => {
    return ${changeCase.camelCase(methodName)}Usecase.execute(params);
}
`;
    }
  
    return `import { Failure } from "../../../core/errors/failure";
import I${changeCase.pascalCase(controllerName)}Datasource from "../../data/datasources/I${changeCase.pascalCase(controllerName)}Datasource";
import I${changeCase.pascalCase(controllerName)}Repository from "../../domain/repositories/I${changeCase.pascalCase(controllerName)}Repository";
import ${changeCase.pascalCase(controllerName)}Datasource from "../../data/datasources/${changeCase.camelCase(controllerName)}Datasource";
import ${changeCase.pascalCase(controllerName)}Repository from "../../data/repositories/${changeCase.camelCase(controllerName)}Repository";
${imports}

const ${changeCase.camelCase(controllerName)}Datasource: I${changeCase.pascalCase(controllerName)}Datasource = new ${changeCase.pascalCase(controllerName)}Datasource(${changeCase.pascalCase(controllerName)}Model, new JWT());
const ${changeCase.camelCase(controllerName)}Repository: I${changeCase.pascalCase(controllerName)}Repository = new ${changeCase.pascalCase(controllerName)}Repository(${changeCase.camelCase(controllerName)}Datasource);
${usecases}

${actions}
`;
  }
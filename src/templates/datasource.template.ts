import * as changeCase from "change-case";

export function getLocalDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);

  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  Future<Model> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }

  return `${imports}
abstract class ${pascalCaseDatasourceName}LocalDatasource {
${methods}
}
`;
}

export function getLocalDatasourceImplTemplate(datasourceName: string): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const snakeCaseDatasourceName = changeCase.snakeCase(datasourceName);
  return `import '${snakeCaseDatasourceName}_local_datasource.dart';

class ${pascalCaseDatasourceName}LocalDatasourceImpl implements ${pascalCaseDatasourceName}LocalDatasource {  
    ${pascalCaseDatasourceName}LocalDatasourceImpl();
  
}
`;
}


export function getRemoteDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  Future<Model> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }
  return `${imports}
abstract class ${pascalCaseDatasourceName}RemoteDatasource {
${methods}
}
`;
}

export function getRemoteDatasourceImplTemplate(datasourceName: string): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const snakeCaseDatasourceName = changeCase.snakeCase(datasourceName);
  return `import '${snakeCaseDatasourceName}_remote_datasource.dart';
  
class ${pascalCaseDatasourceName}RemoteDatasourceImpl implements ${pascalCaseDatasourceName}RemoteDatasource {  
      ${pascalCaseDatasourceName}RemoteDatasourceImpl();
    
}
`;
}
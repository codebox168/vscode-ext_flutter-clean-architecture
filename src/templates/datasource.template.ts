import * as changeCase from "change-case";

export function getLocalDatasourceTemplate (notifierName: string): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  return `abstract class ${pascalCaseNotifierName}LocalDatasource {

}
`;
}

export function getLocalDatasourceImplTemplate (notifierName: string): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  return `import '${snakeCaseNotifierName}_local_datasource.dart';

class ${pascalCaseNotifierName}LocalDatasourceImpl implements ${pascalCaseNotifierName}LocalDatasource {  
    ${pascalCaseNotifierName}LocalDatasourceImpl();
  
}
`;
}


export function getRemoteDatasourceTemplate (notifierName: string): string {
    const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
    return `abstract class ${pascalCaseNotifierName}RemoteDatasource {
  
}
`;
}
  
export function getRemoteDatasourceImplTemplate (notifierName: string): string {
    const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
    const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
    return `import '${snakeCaseNotifierName}_remote_datasource.dart';
  
class ${pascalCaseNotifierName}RemoteDatasourceImpl implements ${pascalCaseNotifierName}RemoteDatasource {  
      ${pascalCaseNotifierName}RemoteDatasourceImpl();
    
}
`;
}
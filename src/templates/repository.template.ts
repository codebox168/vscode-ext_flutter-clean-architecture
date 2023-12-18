import * as changeCase from "change-case";



export function getRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);

  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports+=`import '../params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods +=`
  Future<Either<Failure, Entity>> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }

  return `import 'package:dartz/dartz.dart';
${methodsName.length > 0 ? "\nimport '../../../../core/errors/failures.dart';" : ''}
${imports}

abstract class ${pascalCaseRepositoryName}Repository {
${methods}
}
`;
}

export function getRepositoryImplTemplate(repositoryName: string): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);
  const snakeCaseRepositoryName = changeCase.snakeCase(repositoryName);
  const camelCaseRepositoryName = changeCase.camelCase(repositoryName);
  return `import 'package:dartz/dartz.dart';

import '../../domain/repositories/${snakeCaseRepositoryName}_repository.dart';
import '../datasources/${snakeCaseRepositoryName}_local_datasource.dart';
import '../datasources/${snakeCaseRepositoryName}_remote_datasource.dart';

class ${pascalCaseRepositoryName}RepositoryImpl implements ${pascalCaseRepositoryName}Repository {
  final ${pascalCaseRepositoryName}LocalDatasource _${camelCaseRepositoryName}LocalDatasource;
  final ${pascalCaseRepositoryName}RemoteDatasource _${camelCaseRepositoryName}RemoteDatasource;

  ${pascalCaseRepositoryName}RepositoryImpl({
    required ${pascalCaseRepositoryName}LocalDatasource ${camelCaseRepositoryName}LocalDatasource,
    required ${pascalCaseRepositoryName}RemoteDatasource ${camelCaseRepositoryName}RemoteDatasource,
  }) : _${camelCaseRepositoryName}LocalDatasource = ${camelCaseRepositoryName}LocalDatasource,
       _${camelCaseRepositoryName}RemoteDatasource = ${camelCaseRepositoryName}RemoteDatasource;
}
`;
}
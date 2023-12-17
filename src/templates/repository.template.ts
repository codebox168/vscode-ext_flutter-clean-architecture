import * as changeCase from "change-case";



export function getRepositoryTemplate (notifierName: string): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  return `import 'package:dartz/dartz.dart';

abstract class ${pascalCaseNotifierName}Repository {

}
`;
}

export function getRepositoryImplTemplate (notifierName: string): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  const camelCaseNotifierName = changeCase.camelCase(notifierName);
  return `import 'package:dartz/dartz.dart';

import '../../domain/repositories/${snakeCaseNotifierName}_repository.dart';
import '../datasources/${snakeCaseNotifierName}_local_datasource.dart';
import '../datasources/${snakeCaseNotifierName}_remote_datasource.dart';

class ${pascalCaseNotifierName}RepositoryImpl implements ${pascalCaseNotifierName}Repository {
  final ${pascalCaseNotifierName}LocalDatasource _${camelCaseNotifierName}LocalDatasource;
  final ${pascalCaseNotifierName}RemoteDatasource _${camelCaseNotifierName}RemoteDatasource;

  ${pascalCaseNotifierName}RepositoryImpl({
    required ${pascalCaseNotifierName}LocalDatasource ${camelCaseNotifierName}LocalDatasource,
    required ${pascalCaseNotifierName}RemoteDatasource ${camelCaseNotifierName}RemoteDatasource,
  }) : _${camelCaseNotifierName}LocalDatasource = ${camelCaseNotifierName}LocalDatasource,
       _${camelCaseNotifierName}RemoteDatasource = ${camelCaseNotifierName}RemoteDatasource;
}
`;
}
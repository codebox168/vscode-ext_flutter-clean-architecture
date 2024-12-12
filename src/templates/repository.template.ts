import * as changeCase from "change-case";



export function getRepositoryMethodsTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);

  let methods = '';
  for (let methodName of methodsName) {
    methods += `
  Future<Either<Failure, ${pascalCaseRepositoryName}sPaginateEntity>> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }

  return `${methods}
`;
}

export function getRepositoryTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);

  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import '../params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  Future<Either<Failure, ${pascalCaseRepositoryName}sPaginateEntity>> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }

  return `import 'package:dartz/dartz.dart';

${methodsName.length > 0 ? "\nimport '../../../../core/errors/failures.dart';" : ''}
${imports}import '../../domain/entities/${changeCase.snakeCase(repositoryName)}_entity.dart';
${imports}import '../../domain/entities/${changeCase.snakeCase(repositoryName)}s_paginate_entity.dart';


abstract class ${pascalCaseRepositoryName}Repository {
${methods}
}
`;
}

export function getRepositoryImplMethodsTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);
  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  @override
  Future<Either<Failure, ${pascalCaseRepositoryName}sPaginateEntity>> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  }) async {
    try {
      final result =
          await _${changeCase.camelCase(repositoryName)}RemoteDatasource.${changeCase.camelCase(methodName)}(param: param);
      await _${changeCase.camelCase(repositoryName)}LocalDatasource.save${pascalCaseRepositoryName}s(result);
      return Right(result);
    } on AppException catch (e) {
      return Left(e.toFailure());
    } catch (e) {
      return Left(
        UnknownException(
          code: "${pascalCaseRepositoryName}RepositoryImpl: ${changeCase.camelCase(methodName)}",
          message: e.toString(),
        ).toFailure(),
      );
    }
  }
`;
  }

  return methods;
}

export function getRepositoryImplTemplate(repositoryName: string, methodsName: string[]): string {
  const pascalCaseRepositoryName = changeCase.pascalCase(repositoryName);
  const snakeCaseRepositoryName = changeCase.snakeCase(repositoryName);
  const camelCaseRepositoryName = changeCase.camelCase(repositoryName);
  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  @override
  Future<Either<Failure, ${pascalCaseRepositoryName}sPaginateEntity>> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  }) async {
    try {
      final result =
          await _${changeCase.camelCase(repositoryName)}RemoteDatasource.${changeCase.camelCase(methodName)}(param: param);
      await _${changeCase.camelCase(repositoryName)}LocalDatasource.save${pascalCaseRepositoryName}s(result);
      return Right(result);
    } on AppException catch (e) {
      return Left(e.toFailure());
    } catch (e) {
      return Left(
        UnknownException(
          code: "${pascalCaseRepositoryName}RepositoryImpl: ${changeCase.camelCase(methodName)}",
          message: e.toString(),
        ).toFailure(),
      );
    }
  }
`;
  }



  return `import 'package:dartz/dartz.dart';

import '../../../../core/errors/exceptions.dart';
import '../../../../core/errors/failures.dart';
import '../../domain/entities/${snakeCaseRepositoryName}_entity.dart';
import '../../domain/entities/${snakeCaseRepositoryName}s_paginate_entity.dart';
${imports}
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
  ${methods}
}
`;
}
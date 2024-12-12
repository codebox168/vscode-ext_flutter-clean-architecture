import * as changeCase from "change-case";

export function getUsecaseTemplate(repositoryName: string, usecaseName: string): string {
  return `import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/interfaces/usecase.dart';
import '../entities/${changeCase.snakeCase(repositoryName)}s_paginate_entity.dart';
import '../params/param_${changeCase.snakeCase(usecaseName)}.dart';
import '../repositories/${changeCase.snakeCase(repositoryName)}_repository.dart';

class ${changeCase.pascalCase(usecaseName)}Usecase implements Usecase<Param${changeCase.pascalCase(usecaseName)}, ${changeCase.pascalCase(repositoryName)}sPaginateEntity> {
  final ${changeCase.pascalCase(repositoryName)}Repository _${changeCase.camelCase(repositoryName)}Repository;

  ${changeCase.pascalCase(usecaseName)}Usecase({required ${changeCase.pascalCase(repositoryName)}Repository ${changeCase.camelCase(repositoryName)}Repository})
      : _${changeCase.camelCase(repositoryName)}Repository = ${changeCase.camelCase(repositoryName)}Repository;

  @override
  Future<Either<Failure, ${changeCase.pascalCase(repositoryName)}sPaginateEntity>> call({required Param${changeCase.pascalCase(usecaseName)} param}) {
    return _${changeCase.camelCase(repositoryName)}Repository.${changeCase.camelCase(usecaseName)}(param: param);
  }
}
`;
}
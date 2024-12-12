import * as changeCase from "change-case";

export function getNotifierStateTemplate(
  notifierName: string,
  useEquatable: boolean
): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  return `part of '${snakeCaseNotifierName}_notifier.dart';

sealed class ${pascalCaseNotifierName}sState extends Equatable {
  final ${pascalCaseNotifierName}sPaginateEntity ${changeCase.camelCase(notifierName)}sPaginateEntity;
  const ${pascalCaseNotifierName}sState({
    this.${changeCase.camelCase(notifierName)}sPaginateEntity =
        const ${pascalCaseNotifierName}sPaginateEntity(page: 0, items: {}),
  });
  @override
  List<Object> get props => [${changeCase.camelCase(notifierName)}sPaginateEntity];
}

class ${pascalCaseNotifierName}sInitial extends ${pascalCaseNotifierName}sState {
  const ${pascalCaseNotifierName}sInitial({super.${changeCase.camelCase(notifierName)}sPaginateEntity});
}

class ${pascalCaseNotifierName}sLoading extends ${pascalCaseNotifierName}sState {
  const ${pascalCaseNotifierName}sLoading({super.${changeCase.camelCase(notifierName)}sPaginateEntity});
}

class ${pascalCaseNotifierName}sSuccess extends ${pascalCaseNotifierName}sState {
  const ${pascalCaseNotifierName}sSuccess({required super.${changeCase.camelCase(notifierName)}sPaginateEntity});
}

class ${pascalCaseNotifierName}sFailure extends ${pascalCaseNotifierName}sState {
  final Failure failure;

  const ${pascalCaseNotifierName}sFailure({required this.failure, super.${changeCase.camelCase(notifierName)}sPaginateEntity});
  @override
  List<Object> get props => [failure, ${changeCase.camelCase(notifierName)}sPaginateEntity];
}
`;
}


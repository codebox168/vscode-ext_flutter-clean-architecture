import * as changeCase from "change-case";

export function getNotifierStateTemplate(
  notifierName: string,
  useEquatable: boolean
): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  return `part of '${snakeCaseNotifierName}_notifier.dart';

sealed class ${pascalCaseNotifierName}State extends Equatable {}

class ${pascalCaseNotifierName}Initial extends ${pascalCaseNotifierName}State {
  @override
  List<Object> get props => [];
}

class ${pascalCaseNotifierName}Loading extends ${pascalCaseNotifierName}State {
  @override
  List<Object> get props => [];
}

class ${pascalCaseNotifierName}Success extends ${pascalCaseNotifierName}State {
  final ${pascalCaseNotifierName}Entity ${changeCase.camelCase(notifierName)}Entity;

  const ${pascalCaseNotifierName}Success({required this.${changeCase.camelCase(notifierName)}Entity});
  @override
  List<Object> get props => [${changeCase.camelCase(notifierName)}Entity];
}

class ${pascalCaseNotifierName}Failure extends ${pascalCaseNotifierName}State {
  final Failure failure;

  const ${pascalCaseNotifierName}Failure({required this.failure});
  @override
  List<Object> get props => [failure];
}
`;
}


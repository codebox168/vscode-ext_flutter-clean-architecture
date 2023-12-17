import * as changeCase from "change-case";

export function getNotifierStateTemplate (
  notifierName: string,
  useEquatable: boolean
): string {
  return useEquatable
    ? getEquatableNotifierStateTemplate(notifierName)
    : getDefaultNotifierStateTemplate(notifierName);
}

function getEquatableNotifierStateTemplate (notifierName: string): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  return `part of '${snakeCaseNotifierName}_notifier.dart';

sealed class ${pascalCaseNotifierName}State extends Equatable {
  const ${pascalCaseNotifierName}State();

  @override
  List<Object> get props => [];
}

class ${pascalCaseNotifierName}Initial extends ${pascalCaseNotifierName}State {}
`;
}

function getDefaultNotifierStateTemplate (notifierName: string): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  return `part of '${snakeCaseNotifierName}_notifier.dart';

@immutable
sealed class ${pascalCaseNotifierName}State {}

class ${pascalCaseNotifierName}Initial extends ${pascalCaseNotifierName}State {}
`;
}
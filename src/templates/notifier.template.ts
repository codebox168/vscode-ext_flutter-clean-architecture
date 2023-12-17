import * as changeCase from "change-case";

export function getNotifierTemplate (notifierName: string, useEquatable: boolean): string {
  return useEquatable
    ? getEquatableNotifierTemplate(notifierName)
    : getDefaultNotifierTemplate(notifierName);
}

function getEquatableNotifierTemplate (notifierName: string) {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  const notifierState = `${pascalCaseNotifierName}State`;
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:equatable/equatable.dart';

part '${snakeCaseNotifierName}_state.dart';

class ${pascalCaseNotifierName}Notifier extends StateNotifier<${notifierState}> {
  ${pascalCaseNotifierName}Notifier() : super(${pascalCaseNotifierName}Initial());
}
`;
}

function getDefaultNotifierTemplate (notifierName: string) {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  const notifierState = `${pascalCaseNotifierName}State`;
  return `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:meta/meta.dart';

part '${snakeCaseNotifierName}_state.dart';

class ${pascalCaseNotifierName}Notifier extends StateNotifier<${notifierState}> {
  ${pascalCaseNotifierName}Notifier() : super(${pascalCaseNotifierName}Initial());
}
`;
}
import * as changeCase from "change-case";

export function getNotifierMethodsTemplate(notifierName: string, useEquatable: boolean, actionsName: string[]): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  let methods = ``;
  for (let actionName of actionsName) {
    methods += `
  ${changeCase.camelCase(actionName)}({required Param${changeCase.pascalCase(actionName)} param}) async {
    state = ${changeCase.pascalCase(notifierName)}sLoading(${changeCase.camelCase(notifierName)}sPaginateEntity: ${changeCase.camelCase(notifierName)}sPaginateEntity);
    final result = await ref.read(${changeCase.camelCase(actionName)}Usecase)(param: param);
    result.fold(
      (Failure failure) {
        state = ${pascalCaseNotifierName}sFailure(
          failure: failure,
          ${changeCase.camelCase(notifierName)}sPaginateEntity: state.${changeCase.camelCase(notifierName)}sPaginateEntity,
        );
        state = ${pascalCaseNotifierName}sInitial(
          ${changeCase.camelCase(notifierName)}sPaginateEntity: state.${changeCase.camelCase(notifierName)}sPaginateEntity,
        );
      },
      (${pascalCaseNotifierName}sPaginateEntity ${changeCase.camelCase(notifierName)}sPaginateEntity) {
        state = ${pascalCaseNotifierName}sSuccess(
          ${changeCase.camelCase(notifierName)}sPaginateEntity: ${changeCase.camelCase(notifierName)}sPaginateEntity,
        );
      },
    );
  }
`;
  }

  return `
  ${methods}
`;
}

export function getNotifierTemplate(notifierName: string, useEquatable: boolean, actionsName: string[]): string {
  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  let imports = ``;
  let methods = ``;
  for (let actionName of actionsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(actionName)}.dart';
`;

    methods += `
  ${changeCase.camelCase(actionName)}({required Param${changeCase.pascalCase(actionName)} param}) async {
    state = ${changeCase.pascalCase(notifierName)}sLoading(${changeCase.camelCase(notifierName)}sPaginateEntity: ${changeCase.camelCase(notifierName)}sPaginateEntity);
    final result = await ref.read(${changeCase.camelCase(actionName)}Usecase)(param: param);
    result.fold(
      (Failure failure) {
        state = ${pascalCaseNotifierName}sFailure(
          failure: failure,
          ${changeCase.camelCase(notifierName)}sPaginateEntity: state.${changeCase.camelCase(notifierName)}sPaginateEntity,
        );
        state = ${pascalCaseNotifierName}sInitial(
          ${changeCase.camelCase(notifierName)}sPaginateEntity: state.${changeCase.camelCase(notifierName)}sPaginateEntity,
        );
      },
      (${pascalCaseNotifierName}sPaginateEntity ${changeCase.camelCase(notifierName)}sPaginateEntity) {
        state = ${pascalCaseNotifierName}sSuccess(
          ${changeCase.camelCase(notifierName)}sPaginateEntity: ${changeCase.camelCase(notifierName)}sPaginateEntity,
        );
      },
    );
  }
`;
  }



  return `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../../domain/entities/${snakeCaseNotifierName}_entity.dart';
import '../../${snakeCaseNotifierName}_provider.dart';
${imports}

part '${snakeCaseNotifierName}_state.dart';

class ${pascalCaseNotifierName}Notifier extends Notifier<${pascalCaseNotifierName}State> {
  @override
  ${pascalCaseNotifierName}State build() {
    return const ${pascalCaseNotifierName}sInitial();
  }

  ${methods}
}
`;
}
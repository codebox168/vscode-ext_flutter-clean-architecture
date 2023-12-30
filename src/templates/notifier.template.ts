import * as changeCase from "change-case";

export function getNotifierTemplate(notifierName: string, useEquatable: boolean, actionsName: string[]): string {

  const pascalCaseNotifierName = changeCase.pascalCase(notifierName);
  const snakeCaseNotifierName = changeCase.snakeCase(notifierName);
  const notifierState = `${pascalCaseNotifierName}State`;
  let imports = ``;
  let args = ``;
  let properties = ``;
  let assignsProperties = ``;
  let constuctor = ``;
  let methods = ``;
  for (let actionName of actionsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(actionName)}.dart';
import '../../domain/usecases/${changeCase.snakeCase(actionName)}_usecase.dart';
`;
    args += `required ${changeCase.pascalCase(actionName)}Usecase ${changeCase.camelCase(actionName)}Usecase,
`;
    properties += `final ${changeCase.pascalCase(actionName)}Usecase _${changeCase.camelCase(actionName)}Usecase;
`;
    assignsProperties += `_${changeCase.camelCase(actionName)}Usecase = ${changeCase.camelCase(actionName)}Usecase,
`;
    methods += `
  ${changeCase.camelCase(actionName)}({required Param${changeCase.pascalCase(actionName)} param${changeCase.pascalCase(actionName)}}) async {
    final result = await _${changeCase.camelCase(actionName)}Usecase(param: param${changeCase.pascalCase(actionName)});
    state = result.fold(
      (Failure failure) => ${pascalCaseNotifierName}Error(failure: failure),
      (${pascalCaseNotifierName}Entity ${changeCase.camelCase(notifierName)}Entity) => ${pascalCaseNotifierName}Loaded(${changeCase.camelCase(notifierName)}Entity: ${changeCase.camelCase(notifierName)}Entity),
    );
  }
`;
  }

  if (actionsName.length > 0) {
    constuctor = `
  ${pascalCaseNotifierName}Notifier({
    ${args}})  : ${assignsProperties}super(${pascalCaseNotifierName}Initial());
`;
  } else {
    constuctor = `${pascalCaseNotifierName}Notifier() : super(${pascalCaseNotifierName}Initial());`;
  }



  return `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/errors/failures.dart';
import '../../domain/entities/${snakeCaseNotifierName}_entity.dart';
${imports}

part '${snakeCaseNotifierName}_state.dart';

class ${pascalCaseNotifierName}Notifier extends StateNotifier<${notifierState}> {
  ${properties}
  ${constuctor}
  ${methods}
}
`;
}
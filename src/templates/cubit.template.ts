import * as changeCase from "change-case";

export function getCubitTemplate (cubitName: string, useEquatable: boolean): string {
  return useEquatable
    ? getEquatableCubitTemplate(cubitName)
    : getDefaultCubitTemplate(cubitName);
}

function getEquatableCubitTemplate (cubitName: string) {
  const pascalCaseCubitName = changeCase.pascalCase(cubitName);
  const snakeCaseCubitName = changeCase.snakeCase(cubitName);
  const cubitState = `${pascalCaseCubitName}State`;
  return `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part '${snakeCaseCubitName}_state.dart';

class ${pascalCaseCubitName}Cubit extends Cubit<${cubitState}> {
  ${pascalCaseCubitName}Cubit() : super(${pascalCaseCubitName}Initial());
}
`;
}

function getDefaultCubitTemplate (cubitName: string) {
  const pascalCaseCubitName = changeCase.pascalCase(cubitName);
  const snakeCaseCubitName = changeCase.snakeCase(cubitName);
  const cubitState = `${pascalCaseCubitName}State`;
  return `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:meta/meta.dart';

part '${snakeCaseCubitName}_state.dart';

class ${pascalCaseCubitName}Cubit extends Cubit<${cubitState}> {
  ${pascalCaseCubitName}Cubit() : super(${pascalCaseCubitName}Initial());
}
`;
}
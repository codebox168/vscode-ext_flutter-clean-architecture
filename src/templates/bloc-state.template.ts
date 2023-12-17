import * as changeCase from "change-case";

export function getBlocStateTemplate (
  blocName: string,
  useEquatable: boolean
): string {
  return useEquatable
    ? getEquatableBlocStateTemplate(blocName)
    : getDefaultBlocStateTemplate(blocName);
}

function getEquatableBlocStateTemplate (blocName: string): string {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  return `part of '${snakeCaseBlocName}_bloc.dart';

sealed class ${pascalCaseBlocName}State extends Equatable {
  const ${pascalCaseBlocName}State();  

  @override
  List<Object> get props => [];
}
class ${pascalCaseBlocName}Initial extends ${pascalCaseBlocName}State {}
`;
}

function getDefaultBlocStateTemplate (blocName: string): string {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  return `part of '${snakeCaseBlocName}_bloc.dart';
@immutable
sealed class ${pascalCaseBlocName}State {}
class ${pascalCaseBlocName}Initial extends ${pascalCaseBlocName}State {}
`;
}
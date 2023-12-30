import * as changeCase from "change-case";

export function getEntityTemplate(entityName: string): string {
    const pascalCaseEntityName = changeCase.pascalCase(entityName);
    return `import 'package:equatable/equatable.dart';

class ${pascalCaseEntityName}Entity extends Equatable {
  const ${pascalCaseEntityName}Entity();
  @override
  List<Object?> get props => [];
}
`;
}
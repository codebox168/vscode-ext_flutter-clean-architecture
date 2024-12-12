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

export function getPaginateEntityTemplate(entityName: string): string {
  const pascalCaseEntityName = changeCase.pascalCase(entityName);
  return `import 'package:equatable/equatable.dart';

import '${changeCase.snakeCase(entityName)}_entity.dart';

class ${pascalCaseEntityName}sPaginateEntity extends Equatable {
  final int page;
  final Set<${pascalCaseEntityName}Entity> items;

  const ${pascalCaseEntityName}sPaginateEntity({required this.page, required this.items});
  @override
  List<Object?> get props => [page, items];
}
`;
}
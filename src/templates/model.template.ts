import * as changeCase from "change-case";

export function getModelTemplate(entityName: string): string {
  const pascalCaseEntityName = changeCase.pascalCase(entityName);
  return `import '../../domain/entities/${changeCase.snakeCase(entityName)}_entity.dart';

class ${pascalCaseEntityName}Model extends ${pascalCaseEntityName}Entity {
  const ${pascalCaseEntityName}Model();
  
  factory ${pascalCaseEntityName}Model.fromJson(Map<String, dynamic> json) {
    return ${pascalCaseEntityName}Model();
  }

  Map<String, dynamic> toMap() {
    return {};
  }
}
`;
}
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


export function getModelPaginateTemplate(entityName: string): string {
  const pascalCaseEntityName = changeCase.pascalCase(entityName);
  return `import '../../domain/entities/${changeCase.snakeCase(entityName)}_entity.dart';

class ${pascalCaseEntityName}sPaginateModel extends ${pascalCaseEntityName}PaginateEntity {
  const ${pascalCaseEntityName}sPaginateModel({required super.page, required super.items});
  
  factory ${pascalCaseEntityName}sPaginateModel.fromJson(Map<String, dynamic> json) {
    try {
      return ${pascalCaseEntityName}sPaginateModel(
        page: json['page'],
        items: (json['items'] as List?)
                ?.map((${changeCase.camelCase(entityName)}) => ${pascalCaseEntityName}Model.fromJson(${changeCase.camelCase(entityName)}))
                .toSet() ??
            {},
      );
    } on AppException {
      rethrow;
    } catch (e) {
      throw ModelParsingException(
        code: '${pascalCaseEntityName}sPaginateModel.fromJson',
        message: "$json\\n$e",
      );
    }
  }

  Map<String, dynamic> toMap() {
    try {
      return {
        'page': page,
        'items':
            items.map((${changeCase.camelCase(entityName)}) => (${changeCase.camelCase(entityName)} as ${pascalCaseEntityName}Model).toMap()).toList(),
      };
    } catch (e) {
      throw ModelParsingException(
        code: '${pascalCaseEntityName}sPaginateModel.toMap',
        message: "$e",
      );
    }
  }
}
`;
}
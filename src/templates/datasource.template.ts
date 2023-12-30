import * as changeCase from "change-case";

export function getLocalDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);


  return `import '../models/${changeCase.snakeCase(datasourceName)}_model.dart';

abstract class ${pascalCaseDatasourceName}LocalDatasource {
  Future<${pascalCaseDatasourceName}Model?> get${pascalCaseDatasourceName}();

  Future<void> save${pascalCaseDatasourceName}({
    required ${pascalCaseDatasourceName}Model ${changeCase.camelCase(datasourceName)}Model,
  });

  Future<void> remove${pascalCaseDatasourceName}();
}
`;
}

export function getLocalDatasourceImplTemplate(datasourceName: string): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const snakeCaseDatasourceName = changeCase.snakeCase(datasourceName);
  const camelCaseDatasourceName = changeCase.camelCase(datasourceName);
  return `import 'dart:convert';

import '../../../../core/utils/secure_storage.dart';
import '../models/${snakeCaseDatasourceName}_model.dart';
import '${snakeCaseDatasourceName}_local_datasource.dart';

class ${pascalCaseDatasourceName}LocalDatasourceImpl implements ${pascalCaseDatasourceName}LocalDatasource {  
  final SecureStorage _secureStorage;
  ${pascalCaseDatasourceName}LocalDatasourceImpl({required SecureStorage secureStorage})
    : _secureStorage = secureStorage;
  @override
  Future<${pascalCaseDatasourceName}Model?> get${pascalCaseDatasourceName}() async {
    if (await _secureStorage.isExist(key: '${pascalCaseDatasourceName}')) {
      return ${pascalCaseDatasourceName}Model.fromJson(
        jsonDecode((await _secureStorage.read<String>(key: '${pascalCaseDatasourceName}'))!),
      );
    } else {
      return null;
    }
  }

  @override
  Future<void> remove${pascalCaseDatasourceName}() async {
    await _secureStorage.delete(key: '${pascalCaseDatasourceName}');
  }

  @override
  Future<void> save${pascalCaseDatasourceName}({required ${pascalCaseDatasourceName}Model ${camelCaseDatasourceName}Model}) async {
    await _secureStorage.write<String>(
      key: '${pascalCaseDatasourceName}',
      value: jsonEncode(${camelCaseDatasourceName}Model.toMap()),
    );
  }
}
`;
}


export function getRemoteDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  Future<${changeCase.pascalCase(datasourceName)}Model> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }
  return `${imports}
import '../models/${changeCase.snakeCase(datasourceName)}_model.dart';

abstract class ${pascalCaseDatasourceName}RemoteDatasource {
${methods}
}
`;
}

export function getRemoteDatasourceImplTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const snakeCaseDatasourceName = changeCase.snakeCase(datasourceName);
  let methods = '';
  let imports = '';
  for (let methodName of methodsName) {
    imports += `import '../../domain/params/param_${changeCase.snakeCase(methodName)}.dart';
`;
    methods += `
  @override
  Future<${changeCase.pascalCase(datasourceName)}Model> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  }) async {
    try {
      final result = await _httpClient.get(Uri.parse(""));
      if (result.statusCode == 200) {
        return ${changeCase.pascalCase(datasourceName)}Model.fromJson(jsonDecode(result.body));
      } else {
        throw HttpException(
          code: result.statusCode.toString(),
          message: result.body,
        );
      }
    } on AppException {
      rethrow;
    } catch (e) {
      throw HttpException(
        message: e.toString(),
      );
    }
  }
`;
  }
  return `import 'dart:convert';
import 'package:http/io_client.dart';
${imports}
import '${snakeCaseDatasourceName}_remote_datasource.dart';
import '../models/${changeCase.snakeCase(datasourceName)}_model.dart';
import '../../../../core/errors/exceptions.dart';

class ${pascalCaseDatasourceName}RemoteDatasourceImpl implements ${pascalCaseDatasourceName}RemoteDatasource {  
  final IOClient _httpClient;
  ${pascalCaseDatasourceName}RemoteDatasourceImpl({required IOClient httpClient})
      : _httpClient = httpClient;
${methods}
}
`;
}
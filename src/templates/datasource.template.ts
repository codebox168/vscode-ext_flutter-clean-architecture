import * as changeCase from "change-case";


export function getLocalDatasourceMethodsTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  return `
  Future<${pascalCaseDatasourceName}sPaginateModel> get${pascalCaseDatasourceName}();

  Future<void> save${pascalCaseDatasourceName}s({
    required ${pascalCaseDatasourceName}sPaginateModel ${changeCase.camelCase(datasourceName)}sPaginateModel,
  });

  Future<void> remove${pascalCaseDatasourceName}s();
`;
}

export function getLocalDatasourceTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);


  return `import '../models/${changeCase.snakeCase(datasourceName)}_model.dart';

abstract class ${pascalCaseDatasourceName}LocalDatasource {
  Future<${pascalCaseDatasourceName}sPaginateModel> get${pascalCaseDatasourceName}();

  Future<void> save${pascalCaseDatasourceName}s({
    required ${pascalCaseDatasourceName}sPaginateModel ${changeCase.camelCase(datasourceName)}sPaginateModel,
  });

  Future<void> remove${pascalCaseDatasourceName}s();
}
`;
}


export function getLocalDatasourceImplMethodTemplate(datasourceName: string): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const camelCaseDatasourceName = changeCase.camelCase(datasourceName);
  return `

  @override
  Future<${pascalCaseDatasourceName}sPaginateModel> get${pascalCaseDatasourceName}s() async {
    final ${camelCaseDatasourceName}String = await _storageUtil.read(
      key: AppConst.${pascalCaseDatasourceName}sStorageKey,
    );
    if (${camelCaseDatasourceName}String != null) {
      return ${pascalCaseDatasourceName}sPaginateModel.fromJson(jsonDecode(${camelCaseDatasourceName}String));
    }
    throw const NotFoundException(
      message: "${pascalCaseDatasourceName}LocalDatasource: get${pascalCaseDatasourceName}s: no value in storage",
    );
  }

  @override
  Future<void> remove${pascalCaseDatasourceName}s() async {
    return await _storageUtil.delete(key: AppConst.${camelCaseDatasourceName}StorageKey);
  }

  @override
  Future<void> save${pascalCaseDatasourceName}s(
      ${pascalCaseDatasourceName}sPaginateModel ${camelCaseDatasourceName}sPaginateModel) async {
    return await _storageUtil.write(
      key: AppConst.${camelCaseDatasourceName}StorageKey,
      value: jsonEncode(
        ${camelCaseDatasourceName}sPaginateModel.toMap(),
      ),
    );
  }

`;
}

export function getLocalDatasourceImplTemplate(datasourceName: string): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const snakeCaseDatasourceName = changeCase.snakeCase(datasourceName);
  const camelCaseDatasourceName = changeCase.camelCase(datasourceName);
  return `import 'dart:convert';

import '../../../../core/constants/app_const.dart';
import '../../../../core/errors/exceptions.dart';
import '../../../../core/utils/storage_util.dart';
import '../models/${snakeCaseDatasourceName}s_paginate_model.dart';
import '${snakeCaseDatasourceName}_local_datasource.dart';

class ${pascalCaseDatasourceName}LocalDatasourceImpl implements ${pascalCaseDatasourceName}LocalDatasource {  
  final IStorageUtil _storageUtil;
  ${pascalCaseDatasourceName}LocalDatasourceImpl({required IStorageUtil storageUtil})
      : _storageUtil = storageUtil;
  

  @override
  Future<${pascalCaseDatasourceName}sPaginateModel> get${pascalCaseDatasourceName}s() async {
    final ${camelCaseDatasourceName}String = await _storageUtil.read(
      key: AppConst.${pascalCaseDatasourceName}sStorageKey,
    );
    if (${camelCaseDatasourceName}String != null) {
      return ${pascalCaseDatasourceName}sPaginateModel.fromJson(jsonDecode(${camelCaseDatasourceName}String));
    }
    throw const NotFoundException(
      message: "${pascalCaseDatasourceName}LocalDatasource: get${pascalCaseDatasourceName}s: no value in storage",
    );
  }

  @override
  Future<void> remove${pascalCaseDatasourceName}s() async {
    return await _storageUtil.delete(key: AppConst.${camelCaseDatasourceName}StorageKey);
  }

  @override
  Future<void> save${pascalCaseDatasourceName}s(
      ${pascalCaseDatasourceName}sPaginateModel ${camelCaseDatasourceName}sPaginateModel) async {
    return await _storageUtil.write(
      key: AppConst.${camelCaseDatasourceName}StorageKey,
      value: jsonEncode(
        ${camelCaseDatasourceName}sPaginateModel.toMap(),
      ),
    );
  }
}
`;
}


export function getRemoteDatasourceMethodsTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  let methods = '';
  let imports = '';

  for (let methodName of methodsName) {
    methods += `
  Future<${changeCase.pascalCase(datasourceName)}sPaginateModel> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }
  return `${methods}
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
  Future<${changeCase.pascalCase(datasourceName)}sPaginateModel> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  });
`;
  }
  return `${imports}
import '../models/${changeCase.snakeCase(datasourceName)}_model.dart';
import '../models/${changeCase.snakeCase(datasourceName)}s_paginate_model.dart';

abstract class ${pascalCaseDatasourceName}RemoteDatasource {
${methods}
}
`;
}

export function getRemoteDatasourceImplMethodsTemplate(datasourceName: string, methodsName: string[]): string {
  const pascalCaseDatasourceName = changeCase.pascalCase(datasourceName);
  const snakeCaseDatasourceName = changeCase.snakeCase(datasourceName);
  let methods = '';
  for (let methodName of methodsName) {
    methods += `
  @override
  Future<${changeCase.pascalCase(datasourceName)}sPaginateModel> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  }) async {
    final result = await _httpClient.get<${changeCase.pascalCase(datasourceName)}sPaginateModel>(
      AppConst.${changeCase.camelCase(methodName)}Url,
      queryParameters: param.toMap(),
      fromJson: ${changeCase.pascalCase(datasourceName)}sPaginateModel.fromJson,
    );
    return result.data!;
  }
`;
  }
  return `${methods}
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
  Future<${changeCase.pascalCase(datasourceName)}sPaginateModel> ${changeCase.camelCase(methodName)}({
    required Param${changeCase.pascalCase(methodName)} param,
  }) async {
    final result = await _httpClient.get<${changeCase.pascalCase(datasourceName)}sPaginateModel>(
      AppConst.${changeCase.camelCase(methodName)}Url,
      queryParameters: param.toMap(),
      fromJson: ${changeCase.pascalCase(datasourceName)}sPaginateModel.fromJson,
    );
    return result.data!;
  }
`;
  }
  return `import '../../../../core/constants/app_const.dart';
import '../../../../core/utils/http_client_util.dart';
${imports}
import '${snakeCaseDatasourceName}_remote_datasource.dart';
import '../models/${changeCase.snakeCase(datasourceName)}_model.dart';
import '../models/${changeCase.snakeCase(datasourceName)}s_paginate_model.dart';

import '../../../../core/errors/exceptions.dart';

class ${pascalCaseDatasourceName}RemoteDatasourceImpl implements ${pascalCaseDatasourceName}RemoteDatasource {
  final IHttpClientUtil _httpClient;

  ${pascalCaseDatasourceName}RemoteDatasourceImpl({required IHttpClientUtil httpClient})
      : _httpClient = httpClient;
${methods}
}
`;
}
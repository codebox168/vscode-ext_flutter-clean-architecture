import * as changeCase from "change-case";

export function getProviderTemplate(providerName: string, usecasesName: string[]): string {

    let imports = '';
    let usecases = '';
    let notifierArgs = '';

    for (let usecaseName of usecasesName) {
        imports += `import 'domain/usecases/${changeCase.snakeCase(usecaseName)}_usecase.dart';
`;
        usecases += `
final _${changeCase.camelCase(usecaseName)}Usecase = Provider(
  (ref) => ${changeCase.pascalCase(usecaseName)}Usecase(${changeCase.camelCase(providerName)}Repository: ref.read(_${changeCase.camelCase(providerName)}Repository)),
);
`;
        notifierArgs += `    ${changeCase.camelCase(usecaseName)}Usecase: ref.read(_${changeCase.camelCase(usecaseName)}Usecase),
`;
    }

    return `import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/io_client.dart';

import '../../core/utils/secure_storage.dart';
import 'data/datasources/${changeCase.camelCase(providerName)}_local_datasource_impl.dart';
import 'data/datasources/${changeCase.camelCase(providerName)}_remote_datasource_impl.dart';
import 'data/repositories/${changeCase.camelCase(providerName)}_repository_impl.dart';

${imports}
import 'presentation/notifier/${changeCase.camelCase(providerName)}_notifier.dart';

final _${changeCase.camelCase(providerName)}LocalDatasource = Provider(
  (ref) => ${changeCase.pascalCase(providerName)}LocalDatasourceImpl(secureStorage: SecureStorageImpl()),
);
final _${changeCase.camelCase(providerName)}RemoteDatasource = Provider(
  (ref) => ${changeCase.pascalCase(providerName)}RemoteDatasourceImpl(httpClient: IOClient()),
);

final _${changeCase.camelCase(providerName)}Repository = Provider(
  (ref) => ${changeCase.pascalCase(providerName)}RepositoryImpl(
    ${changeCase.camelCase(providerName)}LocalDatasource: ref.read(_${changeCase.camelCase(providerName)}LocalDatasource),
    ${changeCase.camelCase(providerName)}RemoteDatasource: ref.read(_${changeCase.camelCase(providerName)}RemoteDatasource),
  ),
);
${usecases}
final ${changeCase.camelCase(providerName)}Notifier = Provider(
  (ref) => ${changeCase.pascalCase(providerName)}Notifier(
${notifierArgs}
  ),
);

`;
}
import * as changeCase from "change-case";

export function getBlocTemplate (blocName: string, useEquatable: boolean): string {
  return useEquatable
    ? getEquatableBlocTemplate(blocName)
    : getDefaultBlocTemplate(blocName);
}

function getEquatableBlocTemplate (blocName: string) {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const blocState = `${pascalCaseBlocName}State`;
  const blocEvent = `${pascalCaseBlocName}Event`;
  return `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part '${snakeCaseBlocName}_event.dart';
part '${snakeCaseBlocName}_state.dart';

class ${pascalCaseBlocName}Bloc extends Bloc<${blocEvent}, ${blocState}> {
  ${pascalCaseBlocName}Bloc() : super(${pascalCaseBlocName}Initial()) {
    on<${pascalCaseBlocName}Event>((event, emit) {
      // TODO: implement event handler
    });
  }
}
`;
}

function getDefaultBlocTemplate (blocName: string) {
  const pascalCaseBlocName = changeCase.pascalCase(blocName);
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const blocState = `${pascalCaseBlocName}State`;
  const blocEvent = `${pascalCaseBlocName}Event`;
  return `import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part '${snakeCaseBlocName}_event.dart';
part '${snakeCaseBlocName}_state.dart';

class ${pascalCaseBlocName}Bloc extends Bloc<${blocEvent}, ${blocState}> {
  ${pascalCaseBlocName}Bloc() : super(${pascalCaseBlocName}Initial());
    on<${pascalCaseBlocName}Event>((event, emit) {
      // TODO: implement event handler
    });
  }
}
`;
}
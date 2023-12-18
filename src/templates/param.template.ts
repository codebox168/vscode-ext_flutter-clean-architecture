import * as changeCase from "change-case";

export function getParamTemplate(paramName: string): string {
    const pascalCaseRepositoryName = changeCase.pascalCase(paramName);
    return `import 'package:equatable/equatable.dart';

class Param${pascalCaseRepositoryName} extends Equatable {
  const Param${pascalCaseRepositoryName}();
  @override
  List<Object?> get props => [];
}
`;
}
import * as changeCase from "change-case";

export function getProtoTemplate(serviceName: string, methodsName: string[]): string {

    let requestReplies = '';

    for (let requestReply of methodsName) {
        requestReplies += `
message ${changeCase.pascalCase(requestReply)}Request {
	string Id = 1;
}

message ${changeCase.pascalCase(requestReply)}Reply {
	string Id = 1;
}
`;
    }

    let methods = '';
    for (let methodName of methodsName) {
        methods += `    rpc ${changeCase.pascalCase(methodName)} (${changeCase.pascalCase(methodName)}Request) returns (${changeCase.pascalCase(methodName)}Reply);
`;
    }

    return `syntax = "proto3";

package ${changeCase.snakeCase(serviceName)}_grpc;

option go_package = "./src/presentation/grpc_server/grpc_sevices";

${requestReplies}

service ${changeCase.pascalCase(serviceName)}GrpcService {
${methods}
}
`;
}
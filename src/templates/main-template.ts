import * as changeCase from "change-case";

export function getMainTemplate(featureName: string): string {
	return `package main

import "${changeCase.snakeCase(featureName)}.service.com/src/presentation/grpc_server"
import "${changeCase.snakeCase(featureName)}.service.com/src/presentation/http_server"

func main() {
	go func() {
		grpc_server.StartGrpcServer()
	}()
	go func() {
		http_server.HttpServer()
	}()

	select {}
}
`;
}
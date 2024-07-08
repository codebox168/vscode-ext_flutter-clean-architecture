import * as changeCase from "change-case";

export function getMainTemplate(featureName: string): string {
    return `package main

import "${changeCase.snakeCase(featureName)}.service.com/src/presentation/http_server"

func main() {
	go func() {
		http_server.HttpServer()
	}()

	select {}
}
`;
}
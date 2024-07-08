import * as changeCase from "change-case";

export function getHttpServerTemplate(featureName: string): string {
    return `package http_server

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"${changeCase.snakeCase(featureName)}.service.com/src/presentation/http_server/routes"
)

func HttpServer() {
	app := fiber.New()
	routes.Register${changeCase.pascalCase(featureName)}Routes(app)
	log.Fatal(app.Listen(":3000"))
}

`;
}
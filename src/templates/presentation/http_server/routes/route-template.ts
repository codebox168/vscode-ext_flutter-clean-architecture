import * as changeCase from "change-case";

export function getRouteTemplate(featureName: string, routesName: string[]): string {

	let routes = '';
	for (let routeName of routesName) {
		routes += `
    app.Post("/${changeCase.snakeCase(featureName)}/${changeCase.snakeCase(routeName)}", func(c *fiber.Ctx) error {
		var ${changeCase.camelCase(routeName)}Dto *request_dtos.${changeCase.pascalCase(routeName)}Dto
		if err := utils.ValidateReqDto(c, ${changeCase.camelCase(routeName)}Dto); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"message": err.Error(),
			})
		}

		result, err := ${changeCase.camelCase(featureName)}Repo.${changeCase.pascalCase(routeName)}(${changeCase.camelCase(routeName)}Dto)
		if err != nil {
			return c.JSON(fiber.Map{
				"message": err.Error(),
			})
		}
		return c.JSON(result)
	})
  `;
	}



	return `package routes

import (
	"github.com/gofiber/fiber/v2"
	"${changeCase.camelCase(featureName)}.service.com/core/utils"
	datasources "${changeCase.camelCase(featureName)}.service.com/src/data/datasources"
	"${changeCase.camelCase(featureName)}.service.com/src/data/repositories_impl"
	"${changeCase.camelCase(featureName)}.service.com/src/domain/repositories"
	"${changeCase.camelCase(featureName)}.service.com/src/domain/request_dtos"
)

var ${changeCase.camelCase(featureName)}Collection = utils.Client.Database("mydatabase").Collection("${changeCase.camelCase(featureName)}")
var ${changeCase.camelCase(featureName)}MongoDatasource *datasources.${changeCase.pascalCase(featureName)}MongoDatasource = datasources.New(${changeCase.camelCase(featureName)}Collection)
var ${changeCase.camelCase(featureName)}Repo repositories.${changeCase.pascalCase(featureName)}Repository = repositories_impl.New(${changeCase.camelCase(featureName)}MongoDatasource)

func Register${changeCase.pascalCase(featureName)}Routes(app *fiber.App) {
    ${routes}
}

`;
}
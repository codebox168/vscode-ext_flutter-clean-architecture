import * as changeCase from "change-case";

export function getValidateReqDtoTemplate(): string {
	return `package utils

import (
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

func ValidateReqDto[DtoType any](ctx *fiber.Ctx, dto *DtoType) error {
	ctx.BodyParser(dto)      // \`json:"id"\`
	ctx.CookieParser(dto) 	 // \`cookie:"name"\`
	ctx.ReqHeaderParser(dto) // \`reqHeader:"ids"\`
	ctx.ParamsParser(dto)    // \`params:"id"\`
	ctx.QueryParser(dto)     // \`query:"name"\`
	if err := validate.Struct(dto); err != nil {
		return errors.New("bad request")
	}
	return nil
}
`;
}
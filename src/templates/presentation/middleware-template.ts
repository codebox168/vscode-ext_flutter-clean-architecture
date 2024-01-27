export function getMiddlewareTemplate(): string {
    return `import { NextFunction, Request, Response } from "express";
import Validator from "fastest-validator";
export default function (req: Request, res: Response, next: NextFunction) {
    const validator = new Validator();
    const schema = {
        fieldName: "string"
    };

    const result = validator.compile(schema)(req.body);
    if (result == true) {
        return next();
    } else {
        return res.status(400).json(result)
    }
}
`;
}
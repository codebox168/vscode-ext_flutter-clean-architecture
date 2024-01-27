export function getMiddlewareTemplate(): string {
    return `import { Request, Response } from "express";
import Validator from "fastest-validator";
export default function (req: Request, res: Response) {
    const validator = new Validator();
    const schema = {
        fieldName: "string"
    };

    const result = validator.compile(schema)(req.body);
    if (result == true) {
        return res.status(201).json(req.body);
    } else {
        return res.status(400).json(result)
    }
}
`;
}
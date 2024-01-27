import * as changeCase from "change-case";

export function getRouteTemplate(routeName: string, methodsName: string[]): string {

    let importsAction = 'import {';
    let importsParam = '';
    let importsMiddleware = '';
    let routes = '';
    for (let methodName of methodsName) {
        importsAction += ` ${changeCase.camelCase(methodName)}Action,`;
        importsParam += `import Param${changeCase.pascalCase(methodName)} from "../../domain/params/param.${changeCase.dotCase(methodName)}";
`;
        importsMiddleware += `import ${changeCase.camelCase(methodName)}Middleware from "../middlewares/${changeCase.dotCase(methodName)}.middleware";
`;
        routes += `
router.post('/', ${changeCase.camelCase(methodName)}Middleware, async (req: Request, res: Response) => {
    const result = await ${changeCase.camelCase(methodName)}Action(<Param${changeCase.pascalCase(methodName)}>req.body);
    if (result instanceof Failure) {
        return res.status(result.statusCode).json({ message: result.message })
    }
    return res.status(201).json(result);
});    
`;
    }
    importsAction.slice(0, -1)
    importsAction += ` } from "../controllers/${changeCase.dotCase(routeName)}.controller";`


    return `import { Request, Response, Router } from "express";
import { Failure } from "../../../core/errors/failure";
${importsAction}
${importsParam}${importsMiddleware}
const router = Router({ mergeParams: true });
${routes}
export default router;
`;
}
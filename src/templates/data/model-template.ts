import * as changeCase from "change-case";

export function getModelTemplate(modelName: string): string {
    const pascalCaseModelName = changeCase.pascalCase(modelName);
    const snakeCaseModelName = changeCase.snakeCase(modelName);
    return `import { DataTypes, Model } from "sequelize";
import dbConnection from "../../../core/utils/db.connection"
class ${pascalCaseModelName}Model extends Model { }
${pascalCaseModelName}Model.init({
    fieldName: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize: dbConnection,
    modelName: '${pascalCaseModelName}Model',
    tableName: '${snakeCaseModelName}s'
});
export default dbConnection.models.${pascalCaseModelName}Model;
`;
  }
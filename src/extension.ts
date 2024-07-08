import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";
import * as path from "path";


import {
  commands,
  ExtensionContext,
  InputBoxOptions,
  OpenDialogOptions,
  Uri,
  window,
} from "vscode";
import { existsSync, lstatSync, writeFile } from "fs";
import {
  getDatasourceImplTemplate,
  getDatasourceTemplate,
  getEntityTemplate,
  getGrpcServerTemplate,
  getGrpcServiceTemplate,
  getHttpServerTemplate,
  getIRepositoryTemplate,
  getModelTemplate, 
  getRepositoryTemplate, 
  getRequestDtoTemplate, 
  getResponseDtoTemplate, 
  getRouteTemplate,
} from "./templates";
import { analyzeDependencies } from "./utils";

export function activate(_context: ExtensionContext) {
  analyzeDependencies();

  commands.registerCommand("extension.new-feature", async (uri: Uri) => {
    Go(uri);
  });
}

export async function Go(uri: Uri) {
  // Show feature prompt
  let featureName = await promptForFeatureName();

  // Abort if name is not valid
  if (!isNameValid(featureName)) {
    window.showErrorMessage("The name must not be empty");
    return;
  }
  featureName = `${featureName}`;

  // Show actions prompt
  let actionsName: any = await promptForActions();
  actionsName = `${actionsName?.trim()}`.split(',');


  let targetDirectory = "";
  try {
    targetDirectory = await getTargetDirectory(uri);
  } catch (error: any) {
    window.showErrorMessage(error.message);
  }


  try {
    await generateFeatureArchitecture(
      `${featureName}`,
      targetDirectory,
      actionsName
    );
    window.showInformationMessage(
      `Successfully Generated ${changeCase.pascalCase(featureName)} Feature`
    );
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
}

export function isNameValid(featureName: string | undefined): boolean {
  // Check if feature name exists
  if (!featureName) {
    return false;
  }
  // Check if feature name is null or white space
  if (_.isNil(featureName) || featureName.trim() === "") {
    return false;
  }

  // Return true if feature name is valid
  return true;
}

export async function getTargetDirectory(uri: Uri): Promise<string> {
  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      throw Error("Please select a valid directory");
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  return targetDirectory;
}

export function getFeaturesDirectoryPath(currentDirectory: string): string {
  // Split the path
  const splitPath = currentDirectory.split(path.sep);

  // Remove trailing \
  if (splitPath[splitPath.length - 1] === "") {
    splitPath.pop();
  }

  // Rebuild path
  const result = splitPath.join(path.sep);

  // Determines whether we're already in the features directory or not
  const isDirectoryAlreadyFeatures =
    splitPath[splitPath.length - 1] === "src";

  // If already return the current directory if not, return the current directory with the /features append to it
  return isDirectoryAlreadyFeatures ? result : path.join(result, "");
}

export async function promptForTargetDirectory(): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the feature in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

export function promptForFeatureName(): Thenable<string | undefined> {
  const blocNamePromptOptions: InputBoxOptions = {
    prompt: "Feature Name",
    placeHolder: "counter",
  };
  return window.showInputBox(blocNamePromptOptions);
}

export function promptForActions(): Thenable<string | undefined> {
  const actionListPromptOptions: InputBoxOptions = {
    prompt: "Actions",
    placeHolder: "login,signUp",
  };
  return window.showInputBox(actionListPromptOptions);
}

// create layer directories
export async function createDirectories(
  targetDirectory: string,
  childDirectories: string[]
): Promise<void> {
  // Create the parent directory
  await createDirectory(targetDirectory);
  // Creat the children
  childDirectories.map(
    async (directory) =>
      await createDirectory(path.join(targetDirectory, directory))
  );
}
// create  directory
function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    mkdirp(targetDirectory, (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
}

export async function generateFeatureArchitecture(
  featureName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  // Create the features directory if its does not exist yet
  const featuresDirectoryPath = getFeaturesDirectoryPath(targetDirectory);
  if (!existsSync(featuresDirectoryPath)) {
    await createDirectory(featuresDirectoryPath);
  }

  // Create the feature directory
  const featureDirectoryPath = featuresDirectoryPath;
  await createDirectory(featureDirectoryPath);

  // Create the data layer
  const dataDirectoryPath = path.join(featureDirectoryPath, "data");
  await createDirectories(dataDirectoryPath, [
    "datasources",
    // "models",
    "repositories_impl",
  ]);
  // Generate the repository in the data layer
  await generateRepositoryImplCode(featureName, dataDirectoryPath, actionsName);
  // Generate the datasource in the data layer
  await generateDatasourceCode(featureName, dataDirectoryPath, actionsName);
  // Genarate the model in the data layer
  // await generateModelCode(featureName, dataDirectoryPath);


  // Create the domain layer
  const domainDirectoryPath = path.join(featureDirectoryPath, "domain");
  await createDirectories(domainDirectoryPath, [
    "entities",
    "repositories",
    "request_dtos",
    "response_dtos",
  ]);
  // Generate the repository in the domain layer
  await generateRepositoryCode(featureName, domainDirectoryPath, actionsName);
  // Generate the Entity in the domain layer
  await generateEntityCode(featureName, domainDirectoryPath);
  // Generate the param in the domain layer
  for (let requestDtoName of actionsName) {
    await generateRequestDtoCode(domainDirectoryPath, requestDtoName);
  }
  // Generate the usecase in the domain layer
  for (let responseDtoName of actionsName) {
    await generateResponseDtoCode(domainDirectoryPath, responseDtoName);
  }

  // Create the presentation layer
  const presentationDirectoryPath = path.join(
    featureDirectoryPath,
    "presentation"
  );
  await createDirectories(presentationDirectoryPath, [
    "grpc_server",
    "http_server",
    "graphql_server",
  ]);
  // Generate the grpc server in the presentation layer
  await generateGrpcServerCode(featureName, presentationDirectoryPath, actionsName);
  await generateGrpcServiceCode(featureName, presentationDirectoryPath, actionsName);
  // Generate the http server in the presentation layer
  await generateHttpServerCode(featureName, presentationDirectoryPath, actionsName);
  await generateRoutesCode(featureName, presentationDirectoryPath, actionsName);

}

// ==============================
// genarate file in data layer
// ==============================
async function generateRepositoryImplCode(
  repositoryName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const repositoryDirectoryPath = `${targetDirectory}/repositories_impl`;
  if (!existsSync(repositoryDirectoryPath)) {
    await createDirectory(repositoryDirectoryPath);
  }

  const targetPath = `${targetDirectory}/repositories_impl/${changeCase.snakeCase(repositoryName)}_repository_impl.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(repositoryName)}_repository_impl.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRepositoryTemplate(repositoryName, actionsName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateDatasourceCode(
  localDatasourceName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const localDatasourceDirectoryPath = `${targetDirectory}/datasources`;
  if (!existsSync(localDatasourceDirectoryPath)) {
    await createDirectory(localDatasourceDirectoryPath);
  }

  await Promise.all([
    // createIDatasourceTemplate(localDatasourceName, targetDirectory, actionsName),
    createDatasourceTemplate(localDatasourceName, targetDirectory,actionsName),
  ]);
}

function createIDatasourceTemplate(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const targetPath = `${targetDirectory}/datasources/I${changeCase.dotCase(featureName)}.datasource.ts`;
  if (existsSync(targetPath)) {
    throw Error(`I${changeCase.dotCase(featureName)}.datasource.ts already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getDatasourceTemplate(featureName, actionsName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

function createDatasourceTemplate(
featureName: string, targetDirectory: string, actionsName: string[],
) {
  const targetPath = `${targetDirectory}/datasources/${changeCase.snakeCase(featureName)}_datasource.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(featureName)}_datasource.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getDatasourceImplTemplate(featureName,actionsName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateModelCode(
  modelName: string,
  targetDirectory: string
) {
  const modelsDirectoryPath = `${targetDirectory}/models`;
  if (!existsSync(modelsDirectoryPath)) {
    await createDirectory(modelsDirectoryPath);
  }

  const targetPath = `${targetDirectory}/models/${changeCase.dotCase(modelName)}.model.ts`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.dotCase(modelName)}.model.ts already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getModelTemplate(modelName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

// ===============================
// genarate file in domain layer
// ===============================
async function generateRepositoryCode(
  repositoryName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const repositoryDirectoryPath = `${targetDirectory}/repositories`;
  if (!existsSync(repositoryDirectoryPath)) {
    await createDirectory(repositoryDirectoryPath);
  }

  const targetPath = `${targetDirectory}/repositories/${changeCase.snakeCase(repositoryName)}_repository.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(repositoryName)}_repository.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getIRepositoryTemplate(repositoryName, actionsName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateEntityCode(
  entityName: string,
  targetDirectory: string
) {
  const repositoryDirectoryPath = `${targetDirectory}/entities`;
  if (!existsSync(repositoryDirectoryPath)) {
    await createDirectory(repositoryDirectoryPath);
  }

  const targetPath = `${targetDirectory}/entities/${changeCase.snakeCase(entityName)}_entity.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(entityName)}_entity.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getEntityTemplate(entityName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateRequestDtoCode(
  targetDirectory: string,
  requestDtoName: string
) {
  const paramsDirectoryPath = `${targetDirectory}/request_dtos`;
  if (!existsSync(paramsDirectoryPath)) {
    await createDirectory(paramsDirectoryPath);
  }
  const targetPath = `${targetDirectory}/request_dtos/${changeCase.snakeCase(requestDtoName)}_dto.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(requestDtoName)}_dto.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRequestDtoTemplate(requestDtoName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateResponseDtoCode(
  targetDirectory: string,
  responseDto: string
) {
  const responseDtosDirectoryPath = `${targetDirectory}/response_dtos`;
  if (!existsSync(responseDtosDirectoryPath)) {
    await createDirectory(responseDtosDirectoryPath);
  }
  const targetPath = `${targetDirectory}/response_dtos/${changeCase.snakeCase(responseDto)}_dto.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(responseDto)}_dto.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getResponseDtoTemplate(responseDto),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

// =====================================
// genarate file in presentation layer
// =====================================

async function generateGrpcServerCode(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const grpcServerDirectoryPath = `${targetDirectory}/grpc_server`;
  if (!existsSync(grpcServerDirectoryPath)) {
    await createDirectory(grpcServerDirectoryPath);
  }

  const targetPath = `${targetDirectory}/grpc_server/grpc_server.go`;
  if (existsSync(targetPath)) {
    throw Error(`grpc_server.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getGrpcServerTemplate(featureName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateGrpcServiceCode(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const grpcServiceDirectoryPath = `${targetDirectory}/grpc_server/grpc_services`;
  if (!existsSync(grpcServiceDirectoryPath)) {
    await createDirectory(grpcServiceDirectoryPath);
  }

  const targetPath = `${targetDirectory}/grpc_server/grpc_services/${changeCase.snakeCase(featureName)}_service.go`;
  if (existsSync(targetPath)) {
    throw Error(`grpc_server.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getGrpcServiceTemplate(featureName,actionsName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateHttpServerCode(
  featureName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const httpServerDirectoryPath = `${targetDirectory}/http_server`;
  if (!existsSync(httpServerDirectoryPath)) {
    await createDirectory(httpServerDirectoryPath);
  }

  const targetPath = `${targetDirectory}/http_server/http_server.go`;
  if (existsSync(targetPath)) {
    throw Error(`http_server.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getHttpServerTemplate(featureName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

async function generateRoutesCode(
  featureName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const routesDirectoryPath = `${targetDirectory}/http_server/routes`;
  if (!existsSync(routesDirectoryPath)) {
    await createDirectory(routesDirectoryPath);
  }

  const targetPath = `${targetDirectory}/http_server/routes/${changeCase.snakeCase(featureName)}_route.go`;
  if (existsSync(targetPath)) {
    throw Error(`${changeCase.snakeCase(featureName)}_route.go already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRouteTemplate(featureName,actionsName),
      "utf8",
      (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      }
    );
  });
}

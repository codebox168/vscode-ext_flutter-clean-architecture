import * as _ from "lodash";
import * as changeCase from "change-case";
import * as mkdirp from "mkdirp";
import * as path from "path";

enum StateManagement { bloc, cubit, notifier };

import {
  commands,
  ExtensionContext,
  InputBoxOptions,
  OpenDialogOptions,
  QuickPickOptions,
  Uri,
  window,
} from "vscode";
import { existsSync, lstatSync, writeFile, appendFile } from "fs";
import {
  getBlocEventTemplate,
  getBlocStateTemplate,
  getBlocTemplate,
  getCubitStateTemplate,
  getCubitTemplate,
  getEntityTemplate,
  getModelTemplate,
  getNotifierMethodsTemplate,
  getNotifierStateTemplate,
  getNotifierTemplate,
  getParamTemplate,
  getProviderTemplate,
  getUsecaseTemplate,
} from "./templates";
import { analyzeDependencies } from "./utils";
import { getRepositoryImplMethodsTemplate, getRepositoryImplTemplate, getRepositoryMethodsTemplate, getRepositoryTemplate } from "./templates/repository.template";
import { getLocalDatasourceImplMethodTemplate, getLocalDatasourceImplTemplate, getLocalDatasourceMethodsTemplate, getLocalDatasourceTemplate, getRemoteDatasourceImplMethodsTemplate, getRemoteDatasourceImplTemplate, getRemoteDatasourceMethodsTemplate, getRemoteDatasourceTemplate } from "./templates/datasource.template";
import { appendMethodToClass } from "./utils/append-method-to-class";

export function activate(_context: ExtensionContext) {
  analyzeDependencies();

  commands.registerCommand("extension.new-feature-bloc", async (uri: Uri) => {
    Go(uri, StateManagement.bloc);
  });

  commands.registerCommand("extension.new-feature-cubit", async (uri: Uri) => {
    Go(uri, StateManagement.cubit);
  });

  commands.registerCommand("extension.new-feature-notifier", async (uri: Uri) => {
    Go(uri, StateManagement.notifier);
  });
}

export async function Go(uri: Uri, stateManagement: StateManagement) {
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


  const pascalCaseFeatureName = changeCase.pascalCase(
    featureName
  );
  try {
    await generateFeatureArchitecture(
      `${featureName}`,
      targetDirectory,
      actionsName,
      stateManagement
    );
    window.showInformationMessage(
      `Successfully Generated ${pascalCaseFeatureName} Feature`
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

export async function promptForUseEquatable(): Promise<boolean> {
  const useEquatablePromptValues: string[] = ["no (default)", "yes (advanced)"];
  const useEquatablePromptOptions: QuickPickOptions = {
    placeHolder:
      "Do you want to use the Equatable Package in bloc to override equality comparisons?",
    canPickMany: false,
  };

  const answer = await window.showQuickPick(
    useEquatablePromptValues,
    useEquatablePromptOptions
  );

  return answer === "yes (advanced)";
}

export async function generateFeatureArchitecture(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
  stateManagement: StateManagement
) {
  // Create the features directory if its does not exist yet
  const featuresDirectoryPath = getFeaturesDirectoryPath(targetDirectory);
  await createDirectory(featuresDirectoryPath);

  // Create the feature directory
  const featureDirectoryPath = path.join(featuresDirectoryPath, changeCase.snakeCase(featureName));
  await createDirectory(featureDirectoryPath);

  // Create the data layer
  const dataDirectoryPath = path.join(featureDirectoryPath, "data");
  await createDirectories(dataDirectoryPath, [
    "datasources",
    "models",
    "repositories",
  ]);
  // Generate the model in the data layer
  await generateModelCode(featureName, dataDirectoryPath);
  // Generate the repository_impl in the data layer
  await generateRepositoryImplCode(featureName, dataDirectoryPath, actionsName);
  // Generate the datasource in the data layer
  await generateLocalDatasourceImplCode(featureName, dataDirectoryPath, actionsName);
  await generateRemoteDatasourceImplCode(featureName, dataDirectoryPath, actionsName);

  // Create the domain layer
  const domainDirectoryPath = path.join(featureDirectoryPath, "domain");
  await createDirectories(domainDirectoryPath, [
    "entities",
    "params",
    "repositories",
    "usecases",
  ]);
  // Generate the Entity in the domain layer
  await generateEntityCode(featureName, domainDirectoryPath);
  // Generate the repository in the domain layer
  await generateRepositoryCode(featureName, domainDirectoryPath, actionsName);
  // Generate the param in the domain layer
  for (let paramName of actionsName) {
    await generateParamCode(domainDirectoryPath, paramName);
  }
  // Generate the usecase in the domain layer
  for (let usecaseName of actionsName) {
    await generateUsecaseCode(domainDirectoryPath, usecaseName, featureName);
  }

  // Create the presentation layer
  const presentationDirectoryPath = path.join(
    featureDirectoryPath,
    "presentation"
  );
  await createDirectories(presentationDirectoryPath, [
    StateManagement[stateManagement],
    "pages",
    "widgets",
  ]);

  // Generate the bloc code in the presentation layer
  switch (stateManagement) {
    case StateManagement.bloc:
      await generateBlocCode(featureName, presentationDirectoryPath, true);
      break;
    case StateManagement.cubit:
      await generateCubitCode(featureName, presentationDirectoryPath, true);
      break;
    case StateManagement.notifier:
      await generateNotifierCode(featureName, presentationDirectoryPath, true, actionsName);
      await generateProviderCode(featureName, featureDirectoryPath, actionsName);
      break;
  }
}

async function generateProviderCode(
  featureName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const targetPath = `${targetDirectory}/${changeCase.snakeCase(featureName)}_provider.dart`;
  if (existsSync(targetPath)) {
    console.log(`${changeCase.snakeCase(featureName)}_provider.dart already exists`);
    return;
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getProviderTemplate(featureName, actionsName),
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
    splitPath[splitPath.length - 1] === "features";

  // If already return the current directory if not, return the current directory with the /features append to it
  return isDirectoryAlreadyFeatures ? result : path.join(result, "features");
}

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

function createDirectory(targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!existsSync(targetDirectory)) {
      mkdirp(targetDirectory, (error) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

async function generateRemoteDatasourceImplCode(
  remoteDatasourceName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const remoteDatasourceDirectoryPath = `${targetDirectory}/datasources`;
  await createDirectory(remoteDatasourceDirectoryPath);

  await Promise.all([
    createRemoteDatasourceTemplate(remoteDatasourceName, targetDirectory, actionsName),
    createRemoteDatasourceImplTemplate(remoteDatasourceName, targetDirectory, actionsName),
  ]);
}

async function generateLocalDatasourceImplCode(
  localDatasourceName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const localDatasourceDirectoryPath = `${targetDirectory}/datasources`;
  await createDirectory(localDatasourceDirectoryPath);

  await Promise.all([
    createLocalDatasourceTemplate(localDatasourceName, targetDirectory, actionsName),
    createLocalDatasourceImplTemplate(localDatasourceName, targetDirectory),
  ]);
}

async function generateModelCode(
  modelName: string,
  targetDirectory: string,
) {
  const modelDirectoryPath = `${targetDirectory}/models`;
  await createDirectory(modelDirectoryPath);

  const snakeCaseModelName = changeCase.snakeCase(modelName);
  const targetPath = `${targetDirectory}/models/${snakeCaseModelName}_model.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseModelName}_model.dart already exists`);
    return;
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

async function generateRepositoryImplCode(
  repositoryName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const repositoryDirectoryPath = `${targetDirectory}/repositories`;
  await createDirectory(repositoryDirectoryPath);

  await Promise.all([
    createRepositoryImplTemplate(repositoryName, targetDirectory, actionsName),
  ]);
}

async function generateParamCode(
  targetDirectory: string,
  paramName: string
) {
  const repositoryDirectoryPath = `${targetDirectory}/params`;
  await createDirectory(repositoryDirectoryPath);

  await Promise.all([
    createParamTemplate(targetDirectory, paramName),
  ]);
}

async function generateUsecaseCode(
  targetDirectory: string,
  usecaseName: string,
  repositoryName: string
) {
  const repositoryDirectoryPath = `${targetDirectory}/usecases`;
  await createDirectory(repositoryDirectoryPath);

  await Promise.all([
    createUsecaseTemplate(targetDirectory, usecaseName, repositoryName),
  ]);
}

async function generateEntityCode(
  entityName: string,
  targetDirectory: string
) {
  const entityDirectoryPath = `${targetDirectory}/entities`;
  await createDirectory(entityDirectoryPath);

  const snakeCaseEntityName = changeCase.snakeCase(entityName);
  const targetPath = `${targetDirectory}/entities/${snakeCaseEntityName}_entity.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseEntityName}_entity.dart already exists`);
    return;
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


async function generateRepositoryCode(
  repositoryName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const repositoryDirectoryPath = `${targetDirectory}/repositories`;
  await createDirectory(repositoryDirectoryPath);

  await Promise.all([
    createRepositoryTemplate(repositoryName, targetDirectory, actionsName),
  ]);
}

async function generateBlocCode(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const blocDirectoryPath = `${targetDirectory}/bloc`;
  if (!existsSync(blocDirectoryPath)) {
    await createDirectory(blocDirectoryPath);
  }

  await Promise.all([
    createBlocEventTemplate(blocName, targetDirectory, useEquatable),
    createBlocStateTemplate(blocName, targetDirectory, useEquatable),
    createBlocTemplate(blocName, targetDirectory, useEquatable),
  ]);
}

async function generateCubitCode(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const blocDirectoryPath = `${targetDirectory}/cubit`;
  if (!existsSync(blocDirectoryPath)) {
    await createDirectory(blocDirectoryPath);
  }

  await Promise.all([
    createCubitStateTemplate(blocName, targetDirectory, useEquatable),
    createCubitTemplate(blocName, targetDirectory, useEquatable),
  ]);
}

async function generateNotifierCode(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean,
  actionsName: string[],
) {
  const blocDirectoryPath = `${targetDirectory}/notifier`;
  await createDirectory(blocDirectoryPath);


  await Promise.all([
    createNotifierStateTemplate(blocName, targetDirectory, useEquatable),
    createNotifierTemplate(blocName, targetDirectory, useEquatable, actionsName),
  ]);
}



function createBlocEventTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/bloc/${snakeCaseBlocName}_event.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_event.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getBlocEventTemplate(blocName, useEquatable),
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

function createBlocStateTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/bloc/${snakeCaseBlocName}_state.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_state.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getBlocStateTemplate(blocName, useEquatable),
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

function createBlocTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/bloc/${snakeCaseBlocName}_bloc.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_bloc.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getBlocTemplate(blocName, useEquatable),
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

function createCubitStateTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/cubit/${snakeCaseBlocName}_state.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_state.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getCubitStateTemplate(blocName, useEquatable),
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

function createCubitTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/cubit/${snakeCaseBlocName}_cubit.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_cubit.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getCubitTemplate(blocName, useEquatable),
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


function createNotifierStateTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/notifier/${snakeCaseBlocName}_state.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseBlocName}_state.dart already exists`);
    return;
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getNotifierStateTemplate(blocName, useEquatable),
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

function createNotifierTemplate(
  blocName: string,
  targetDirectory: string,
  useEquatable: boolean,
  actionsName: string[],
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/notifier/${snakeCaseBlocName}_notifier.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseBlocName}_notifier.dart already exists`);
    let methodToAppend = getNotifierMethodsTemplate(blocName, useEquatable, actionsName);
    let newFileContent = appendMethodToClass(targetPath, methodToAppend);
    return new Promise(async (resolve, reject) => {
      writeFile(
        targetPath,
        newFileContent,
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
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getNotifierTemplate(blocName, useEquatable, actionsName),
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

function createParamTemplate(
  targetDirectory: string,
  paramName: string,
) {
  const snakeCaseParamName = changeCase.snakeCase(paramName);
  const targetPath = `${targetDirectory}/params/param_${snakeCaseParamName}.dart`;
  if (existsSync(targetPath)) {
    console.log(`param_${snakeCaseParamName}.dart already exists`);
    return;
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getParamTemplate(paramName),
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

function createUsecaseTemplate(
  targetDirectory: string,
  usecaseName: string,
  repositoryName: string,
) {
  const targetPath = `${targetDirectory}/usecases/${changeCase.snakeCase(usecaseName)}_usecase.dart`;
  if (existsSync(targetPath)) {
    console.log(`${changeCase.snakeCase(usecaseName)}_usecase.dart already exists`);
    return;
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getUsecaseTemplate(repositoryName, usecaseName),
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

function createRepositoryTemplate(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/repositories/${snakeCaseFeatureName}_repository.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseFeatureName}_repository.dart already exists`);
    let methodToAppend = getRepositoryMethodsTemplate(featureName, actionsName);
    let newFileContent = appendMethodToClass(targetPath, methodToAppend);
    return new Promise(async (resolve, reject) => {
      writeFile(
        targetPath,
        newFileContent,
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
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRepositoryTemplate(featureName, actionsName),
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

async function createRepositoryImplTemplate(
  featureName: string,
  targetDirectory: string,
  actionsName: string[]
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/repositories/${snakeCaseFeatureName}_repository_impl.dart`;
  if (existsSync(targetPath)) {
    let methodToAppend = getRepositoryImplMethodsTemplate(featureName, actionsName);
    let newFileContent = appendMethodToClass(targetPath, methodToAppend);
    console.log(`${snakeCaseFeatureName}_repository_impl.dart already exists`);
    return new Promise(async (resolve, reject) => {
      writeFile(
        targetPath,
        newFileContent,
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
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRepositoryImplTemplate(featureName, actionsName),
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

function createLocalDatasourceTemplate(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_local_datasource.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseFeatureName}_local_datasource.dart already exists`);
    return;
    // let methodToAppend = getLocalDatasourceMethodsTemplate(featureName, actionsName);
    // let newFileContent = appendMethodToClass(targetPath,methodToAppend);
    // return new Promise(async (resolve, reject) => {
    //   writeFile(
    //     targetPath,
    //     newFileContent,
    //     "utf8",
    //     (error) => {
    //       if (error) {
    //         reject(error);
    //         return;
    //       }
    //       resolve(true);
    //     }
    //   );
    // });
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getLocalDatasourceTemplate(snakeCaseFeatureName, actionsName),
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

function createLocalDatasourceImplTemplate(
  featureName: string,
  targetDirectory: string,
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_local_datasource_impl.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseFeatureName}_local_datasource_impl.dart already exists`);
    return;
    // let methodToAppend = getLocalDatasourceImplMethodTemplate(featureName);
    // let newFileContent = appendMethodToClass(targetPath,methodToAppend);
    // return new Promise(async (resolve, reject) => {
    //   writeFile(
    //     targetPath,
    //     newFileContent,
    //     "utf8",
    //     (error) => {
    //       if (error) {
    //         reject(error);
    //         return;
    //       }
    //       resolve(true);
    //     }
    //   );
    // });
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getLocalDatasourceImplTemplate(snakeCaseFeatureName),
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

function createRemoteDatasourceTemplate(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_remote_datasource.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseFeatureName}_remote_datasource.dart already exists`);
    let methodToAppend = getRemoteDatasourceMethodsTemplate(snakeCaseFeatureName, actionsName);
    let newFileContent = appendMethodToClass(targetPath, methodToAppend);
    return new Promise(async (resolve, reject) => {
      writeFile(
        targetPath,
        newFileContent,
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
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRemoteDatasourceTemplate(snakeCaseFeatureName, actionsName),
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

function createRemoteDatasourceImplTemplate(
  featureName: string,
  targetDirectory: string,
  actionsName: string[],
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_remote_datasource_impl.dart`;
  if (existsSync(targetPath)) {
    console.log(`${snakeCaseFeatureName}_remote_datasource_impl.dart already exists`);
    let methodToAppend = getRemoteDatasourceImplMethodsTemplate(snakeCaseFeatureName, actionsName);
    let newFileContent = appendMethodToClass(targetPath, methodToAppend);
    return new Promise(async (resolve, reject) => {
      writeFile(
        targetPath,
        newFileContent,
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
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRemoteDatasourceImplTemplate(snakeCaseFeatureName, actionsName),
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

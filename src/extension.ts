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
  getNotifierStateTemplate,
  getNotifierTemplate,
} from "./templates";
import { analyzeDependencies } from "./utils";
import { getRepositoryImplTemplate, getRepositoryTemplate } from "./templates/repository.template";
import { getLocalDatasourceImplTemplate, getLocalDatasourceTemplate, getRemoteDatasourceImplTemplate, getRemoteDatasourceTemplate } from "./templates/datasource.template";

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

  let targetDirectory = "";
  try {
    targetDirectory = await getTargetDirectory(uri);
  } catch (error: any) {
    window.showErrorMessage(error.message);
  }

  const useEquatable = true;

  const pascalCaseFeatureName = changeCase.pascalCase(
    featureName
  );
  try {
    await generateFeatureArchitecture(
      `${featureName}`,
      targetDirectory,
      useEquatable,
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

async function generateRemoteDatasourceImplCode(
  remoteDatasourceName: string,
  targetDirectory: string,
) {
  const remoteDatasourceDirectoryPath = `${targetDirectory}/datasources`;
  if (!existsSync(remoteDatasourceDirectoryPath)) {
    await createDirectory(remoteDatasourceDirectoryPath);
  }

  await Promise.all([
    createRemoteDatasourceTemplate(remoteDatasourceName, targetDirectory),
    createRemoteDatasourceImplTemplate(remoteDatasourceName, targetDirectory),
  ]);
}

async function generateLocalDatasourceImplCode(
  localDatasourceName: string,
  targetDirectory: string,
) {
  const localDatasourceDirectoryPath = `${targetDirectory}/datasources`;
  if (!existsSync(localDatasourceDirectoryPath)) {
    await createDirectory(localDatasourceDirectoryPath);
  }

  await Promise.all([
    createLocalDatasourceTemplate(localDatasourceName, targetDirectory),
    createLocalDatasourceImplTemplate(localDatasourceName, targetDirectory),
  ]);
}

async function generateRepositoryImplCode(
  repositoryName: string,
  targetDirectory: string,
) {
  const repositoryDirectoryPath = `${targetDirectory}/repositories`;
  if (!existsSync(repositoryDirectoryPath)) {
    await createDirectory(repositoryDirectoryPath);
  }

  await Promise.all([
    createRepositoryImplTemplate(repositoryName, targetDirectory),
  ]);
}

async function generateRepositoryCode(
  repositoryName: string,
  targetDirectory: string,
) {
  const repositoryDirectoryPath = `${targetDirectory}/repositories`;
  if (!existsSync(repositoryDirectoryPath)) {
    await createDirectory(repositoryDirectoryPath);
  }

  await Promise.all([
    createRepositoryTemplate(repositoryName, targetDirectory),
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
  useEquatable: boolean
) {
  const blocDirectoryPath = `${targetDirectory}/notifier`;
  if (!existsSync(blocDirectoryPath)) {
    await createDirectory(blocDirectoryPath);
  }

  await Promise.all([
    createNotifierStateTemplate(blocName, targetDirectory, useEquatable),
    createNotifierTemplate(blocName, targetDirectory, useEquatable),
  ]);
}

export async function generateFeatureArchitecture(
  featureName: string,
  targetDirectory: string,
  useEquatable: boolean,
  stateManagement: StateManagement
) {
  // Create the features directory if its does not exist yet
  const featuresDirectoryPath = getFeaturesDirectoryPath(targetDirectory);
  if (!existsSync(featuresDirectoryPath)) {
    await createDirectory(featuresDirectoryPath);
  }

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
  // Generate the repository_impl in the data layer
  await generateRepositoryImplCode(featureName, dataDirectoryPath);
  // Generate the datasource in the data layer
  await generateLocalDatasourceImplCode(featureName, dataDirectoryPath);
  await generateRemoteDatasourceImplCode(featureName, dataDirectoryPath);
  // Create the domain layer
  const domainDirectoryPath = path.join(featureDirectoryPath, "domain");
  await createDirectories(domainDirectoryPath, [
    "entities",
    "params",
    "repositories",
    "usecases",
  ]);
  // Generate the repository in the domain layer
  await generateRepositoryCode(featureName, domainDirectoryPath);
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
      await generateNotifierCode(featureName, presentationDirectoryPath, true);
      break;
  }
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
    mkdirp(targetDirectory, (error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  });
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
    throw Error(`${snakeCaseBlocName}_state.dart already exists`);
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
  useEquatable: boolean
) {
  const snakeCaseBlocName = changeCase.snakeCase(blocName);
  const targetPath = `${targetDirectory}/notifier/${snakeCaseBlocName}_notifier.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseBlocName}_notifier.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getNotifierTemplate(blocName, useEquatable),
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
  targetDirectory: string
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/repositories/${snakeCaseFeatureName}_repository.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseFeatureName}_repository.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRepositoryTemplate(featureName),
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

function createRepositoryImplTemplate(
  featureName: string,
  targetDirectory: string
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/repositories/${snakeCaseFeatureName}_repository_impl.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseFeatureName}_repository_impl.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRepositoryImplTemplate(featureName),
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
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_local_datasource.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseFeatureName}_local_datasource.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getLocalDatasourceTemplate(snakeCaseFeatureName),
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
    throw Error(`${snakeCaseFeatureName}_local_datasource_impl.dart already exists`);
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
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_remote_datasource.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseFeatureName}_remote_datasource.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRemoteDatasourceTemplate(snakeCaseFeatureName),
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
) {
  const snakeCaseFeatureName = changeCase.snakeCase(featureName);
  const targetPath = `${targetDirectory}/datasources/${snakeCaseFeatureName}_remote_datasource_impl.dart`;
  if (existsSync(targetPath)) {
    throw Error(`${snakeCaseFeatureName}_remote_datasource_impl.dart already exists`);
  }
  return new Promise(async (resolve, reject) => {
    writeFile(
      targetPath,
      getRemoteDatasourceImplTemplate(snakeCaseFeatureName),
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

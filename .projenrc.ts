import { LernaProject } from 'lerna-projen';
import { javascript, JsonFile, Project, vscode } from 'projen';
import { TypeScriptAppProject, TypeScriptProject } from 'projen/lib/typescript';
import { execSync } from 'child_process';
import path from 'path';
import flatten from 'flat';
import { JsiiProject } from 'projen/lib/cdk';
import { VsCode } from 'projen/lib/vscode';
import { camelCase } from 'camel-case';
import { JavaProject } from 'projen/lib/java';

const defaultReleaseBranch = 'main';
const subProjectRootDirPath = 'projects';
const exampleProjectRootDirPath = 'examples';
const repositoryUrl = 'https://github.com/ApexCaptain/mono-repo-template';
const author = 'ApexCaptain';
const authorAddress = 'https://github.com/ApexCaptain';
const npmRegistryUrl = 'https://npm.pkg.github.com/';
const mavenRepositoryUrl = 'https://maven.pkg.github.com/';
const authorOrganization = 'apexcaptain';
const rootProjectName = 'mono-repo-template';

const rootProject = new LernaProject({
  release: false,
  deps: [
    /** @ToDo jest 타입 매핑이 서브 프로젝트에서 개별적으로 적용되지 않음 */
    '@types/jest',
    '@types/flat',
    'flatley',
    'camel-case',
  ],
  defaultReleaseBranch,
  devDeps: ['lerna-projen'],
  name: `@${authorOrganization}/${rootProjectName}`,
  projenrcTs: true,
  majorVersion: 1,
  releaseWorkflowSetupSteps: [
    {
      name: 'Init Projen',
      run: 'yarn projen',
    },
  ],
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['develop'],
    },
  },
  prettier: true,
  prettierOptions: {
    settings: {
      endOfLine: javascript.EndOfLine.AUTO,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: javascript.TrailingComma.ALL,
    },
  },
  gitignore: ['env'],
});

const nestBackendTsAppProject = new TypeScriptAppProject({
  defaultReleaseBranch,
  name: `${rootProject.name}-backend`,
  parent: rootProject,
  outdir: `${subProjectRootDirPath}/backend`,
});

const commonTsPackageProject = new TypeScriptProject({
  defaultReleaseBranch,
  name: `${rootProject.name}-common`,
  parent: rootProject,
  outdir: `${subProjectRootDirPath}/common`,
  npmRegistryUrl,
});

const clientPackageJsiiProject = new JsiiProject({
  defaultReleaseBranch,
  name: `${rootProject.name}-client`,
  parent: rootProject,
  outdir: `${subProjectRootDirPath}/client`,
  npmRegistryUrl,
  repositoryUrl,
  author,
  authorAddress,
  publishToMaven: {
    javaPackage: `com.github.${author}.${camelCase(
      `${rootProjectName}-client`,
    )}`,
    mavenRepositoryUrl,
    mavenGroupId: `com.github.${author}`,
    mavenArtifactId: `${rootProjectName}-client`,
  },
});

const clientPackageJavaTestProject = new JavaProject({
  name: `${clientPackageJsiiProject.name}-example-java`,
  groupId: `com.github.${author}.example`,
  artifactId: `${rootProjectName}-client-example`,
  version: '1.0.0',
  parent: clientPackageJsiiProject,
  outdir: `${exampleProjectRootDirPath}/client/java`,
  deps: [`com.github.${author}/${rootProjectName}-client@0.0.0`],
});

void (async () => {
  // Modify root project package.json
  rootProject.addFields({
    private: true,
  });

  // Symlinks
  {
    const symlinks: {
      scope: Project;
      dependencies: Project[];
      mode: 'prod' | 'dev' | 'peer';
    }[] = [];
    rootProject.postSynthesize = () => {
      symlinks.forEach((eachSymLink) => {
        eachSymLink.dependencies.forEach((eachDependency) => {
          execSync(
            `lerna add ${eachDependency.name} --scope=${
              eachSymLink.scope.name
            } ${
              eachSymLink.mode == 'dev'
                ? '--dev'
                : eachSymLink.mode == 'peer'
                ? '--peer'
                : ''
            }`,
          );
        });
      });
    };
  }
  // Modify VsCode
  {
    const vsCode = new VsCode(rootProject);
    const flatley = <TargetType, ResultType>(
      target: TargetType,
      opts?: {
        coercion?: {
          test: (key: string, value: any) => boolean;
          transform: (value: any) => any;
        }[];
        filters?: {
          test: (key: string, value: any) => boolean;
        }[];
      } & Parameters<typeof flatten>[1],
    ): ResultType => {
      return require('flatley')(target, opts);
    };

    class VsCodeSettingObject<ObjectType extends Object> {
      constructor(private readonly pValue: ObjectType) {}
      get value(): ObjectType {
        return this.pValue;
      }
    }
    // Add vscode settings

    vsCode.settings.addSettings(
      flatley(
        {
          eslint: {
            workingDirectories: new VsCodeSettingObject(
              Object.values<Project>(rootProject['subprojects']).map(
                (eachSubProject) =>
                  path.relative(rootProject.outdir, eachSubProject.outdir),
              ),
            ),
          },
          java: {
            configuration: {
              updateBuildConfiguration: 'automatic',
            },
          },
          todohighlight: {
            toggleURI: true,
            isCaseSensitive: false,
            keywords: new VsCodeSettingObject([
              {
                text: '@' + 'ToDo',
                color: 'red',
                backgroundColor: 'pink',
              },
            ]),
            exclude: ['**/node_modules/**', '.vscode'],
          },
        },
        {
          safe: true,
          coercion: [
            {
              test: (_, value) => {
                return value instanceof VsCodeSettingObject;
              },
              transform: (value: VsCodeSettingObject<any>) => value.value,
            },
          ],
        },
      ),
    );
  }

  rootProject.synth();
})();

import { LernaProject } from 'lerna-projen';
import { javascript, JsonFile } from 'projen';
import { TypeScriptAppProject } from 'projen/lib/typescript';
import path from 'path';

const defaultReleaseBranch = 'main';
const subProjectRootDirPath = 'projects';
const npmRegistryUrl = 'https://npm.pkg.github.com/';

const rootProject = new LernaProject({
  defaultReleaseBranch,
  devDeps: ['lerna-projen'],
  name: '@apexcaptain/mono-repo-template',
  projenrcTs: true,
  majorVersion: 1,
  releaseWorkflowSetupSteps: [
    {
      name: 'Init Projen',
      run: 'yarn projen',
    },
  ],
  prettier: true,
  prettierOptions: {
    settings: {
      endOfLine: javascript.EndOfLine.AUTO,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: javascript.TrailingComma.ALL,
    },
  },
});

const nestBackendProject = new TypeScriptAppProject({
  defaultReleaseBranch,
  name: `${rootProject.name}-backend`,
  parent: rootProject,
  outdir: `${subProjectRootDirPath}/backend`,
});

void (async () => {
  const subProjects = [nestBackendProject];

  // Modify root project package.json
  rootProject.addFields({
    private: true,
  });
  // VsCode Settings
  new JsonFile(rootProject, '.vscode/settings.json', {
    obj: {
      'eslint.workingDirectories': subProjects.map((eachSubProject) =>
        path.relative(rootProject.outdir, eachSubProject.outdir),
      ),
    },
  });
  rootProject.synth();
})();

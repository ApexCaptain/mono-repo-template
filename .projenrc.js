const { LernaProject } = require("lerna-projen");
const project = new LernaProject({
  defaultReleaseBranch: "main",
  devDeps: ["lerna-projen@0.0.338"],
  name: "workspace",
  projenrcTs: true,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
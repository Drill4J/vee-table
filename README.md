# Vee Table

Keep your zoo of the components, versions and setup variations in check. Make this data available as simple JSON hosted with GitHub.

Track the existing:

1. _Components_
2. _Versions_ of these components
3. _Setups_ comprised of these components
4. _Test results_ for these setups

This is a monorepo for all stuff related to that task.

Check out the ["How It Works"](./HOW_IT_WORKS.md) for more detailed explanation of inner-workings.

## Development

**Prerequisite**: This project assumes you've installed [Lerna](https://github.com/lerna/lerna) globally (`npm i -g lerna`)

### Build

1. Install dependencies

   ```shell
   npm run install-deps
   ```

2. Make a production build

   ```shell
   npm run build
   ```

### Making changes

1. Run in development mode (launches "start" script for each package)

   ```shell
   lerna run start --stream
   ```

2. Install new dependency to all packages (into _each_ node_module folder)

   ```shell
   lerna add *package-name*
   ```

3. Add dependency to the specific package

   ```shell
   lerna add *package-name* --scope=@drill4j/vee-ledger # add --dev to install to devDependencies
   ```

   > WARN: No packages found where _package-name_ can be added.
   >
   > Solution: you either _already installed_ this package or trying to install _multiple packages_ (add them one by one)

4. To make dependency common (add to the _root-level_ node_modules folder) add new entry to the lerna.json bootstrap.hoist string

   ```json
   {
     "packages": ["packages/*"],
     "version": "0.0.0",
     "command": {
       "bootstrap": {
         "hoist": "{@types/node,typescript,ts-loader,webpack,webpack-cli,webpack-node-externals}" // <--add new comma-separated entry here
       }
     }
   }
   ```

### Debug github action

> Prerequisite: VS-code (one may use another editor, but then vscode debug config won't apply)

1. Temporarily add the following line to [./packages/github-action/package.json](./packages/github-action/package.json)

   ```json
      ...
      "type":"module",
      ...
   ```

2. Set breakpoints in [./packages/github-action/build/index.js](./packages/github-action/build/index.js)

   > TIP: you can also debug `ledger` package right there, as it's bundled with the action's code

3. Open [.vscode/launch.json](.vscode/launch.json) and edit "env" for "Debug github-action" configuration

   - Make sure to set `INPUT_GITHUB-ACCESS-TOKEN` variable (GitHub personal access token will work)
   - !!Don't commit **YOUR** personal access token!! It's going to be available for the whole world

4. Once you're done don't forget:
   - to remove `"type": "module"` line from package.json. Otherwise `build` command will fail
   - to remove `INPUT_GITHUB-ACCESS-TOKEN` from [.vscode/launch.json](.vscode/launch.json)

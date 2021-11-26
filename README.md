# Vee Table

Keep your zoo of the components, versions and setup variations in check. Make this data available as simple JSON hosted with GitHub.

Track the existing:

1. _Components_
2. _Versions_ of these components
3. _Setups_ comprised of these components
4. _Test results_ for these setups

This is a monorepo for all stuff related to that task.

Check out the ["How It Works"](./HOW_IT_WORKS.md) for more detailed explanation of inner-workings.

## github-action hack

the actual `action.yml` used by github is placed in **project root**
**Q: why?** A: github cannot see action.yml in subfolders. It is possible to make it "more obvious". Create a script to:

1. Create a separate branch github-action
2. Commit packages/github-action/build folder to the root
3. Tag it with the appropriate tag (btw it could be something odd like `gh-0.0.0` to distinguish from "normal" tags)

Then use that tag reference in workflow files as usual (`uses: Drill4j/vee-table@gh-0.0.0`)

script sketch:

```shell
   branch -d github-action
   git add --force packages/github-action/build # force option is required since normally build _should_ be .gitignore-d
   switch --orphan github-action
   mv packages/github-action/build . # this actually does not work "as intended" because build folder is preserved, not "unpacked" in root
   npm version # patch, minor, major, whatever
   git tag # use package.json version field
   git commit -m "new branch version"
```

## Development

**Prerequisite**: This project assumes you've installed [Lerna](https://github.com/lerna/lerna) globally (`npm i -g lerna`)

### Build

1. Install dependencies

   ```shell
   npm run install-deps
   ```

2. Make a production build (all packages at once)

   ```shell
   npm run build
   ```

> TIP: you absolutely _can_ build a single package, just navigate to package folder and call build script manually

### Dependency management

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

## Publish

**! FIRST STEP !** - install dependencies by running the following command in **root** project directory

```shell
lerna bootstrap
```

If you do not install dependencies in such a way, packages do not get hoisted, and depending on the level of responsibility of previous developers, you may end up with missing packages.

### Ledger

Ledger is not really "published" to NPM or any other registry. You build it and then bundle with other packages (UI, github-action)

You have to prepare it with

```shell
   lerna run publish --scope=@drill4j
```

It's `build` folder and `package.json` are bundled with during **build processes of** UI and github-action

### UI

```shell
lerna run deploy --scope=@drill4j/vee-ui
```

### Github Action

1. Build action with

   ```shell
   lerna run build --scope=@drill4j/vee-github-action
   ```

2. Commit and push updated build `packages/github-action/build` as usual

   ```shell
      git add .
      git commit -m "my message"
      git push origin main
   ```

3. Set the appropriate tag and publish it to remote

   ```shell
      git tag *new tag*
      git push --tags
   ```

> TIP/WORKAROUND: you can use `packages/github-action/retag.sh` to move `0.0.0` tag to current commit, to avoid necessity to update action version in workflows using it

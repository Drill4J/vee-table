#

## Development

**Prerequisite**: This project assumes you've installed [Lerna](https://github.com/lerna/lerna) globally (`npm i -g lerna`)

Run `npm run build` which in turn will execute

```shell
lerna bootstrap --hoist={@types/node,typescript,awesome-typescript-loader,webpack-cli,webpack-node-externals} -- --legacy-peer-deps
```

> TODO --legacy-peer-deps is added to allow awesome-typescript-loader. Replace it, as it does not support modern TS versions (it requires ^3)

Add dependency to the single package

```shell
lerna add *package-name* --scope=@drill4j/vee-ledger # add --dev to install to devDependencies
```

Run in development mod (launches "start" script for each package)

```shell
lerna run start --stream
```

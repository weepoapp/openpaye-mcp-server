# OpenPaye MCP Server

Serveur MCP (Model Context Protocol) pour l'API OpenPaye, avec la meme stack TypeScript/Node et une architecture modulaire proche du serveur BoondManager.

## Stack

- Node.js >= 20
- TypeScript strict
- `@modelcontextprotocol/sdk`
- Zod
- Pino
- Vitest + ESLint

## Installation

```bash
npm install
npm run build
```

## Configuration

L’API OpenPaye utilise une authentification **Basic Auth** avec un **identifiant** et une **clé API** (pas nécessairement le même couple que la connexion web). Où les trouver : depuis la liste des dossiers de paie, menu **Paramètres → Accès API**. Voir la documentation officielle : [Accès API](https://www.openpaye.co/docs/acces-api).

### Claude Desktop / extension `.mcpb`

Lorsque vous installez le bundle MCP (`.mcpb`), Claude peut afficher un formulaire de configuration : renseignez-y les mêmes champs que dans OpenPaye (**identifiant** et **clé API**). Ils sont transmis au serveur sous forme de variables d’environnement `OPENPAYE_API_USER` et `OPENPAYE_API_KEY` (voir `manifest.json`, section `user_config` et `mcp_config.env`).

### Variables d’environnement (ligne de commande ou config MCP manuelle)

Variables requises pour les appels API :

- `OPENPAYE_API_USER` — identifiant API (Basic Auth)
- `OPENPAYE_API_KEY` — clé API (Basic Auth)

Variables optionnelles :

- `OPENPAYE_BASE_URL` (defaut: `https://api.openpaye.co`)
- `OPENPAYE_HTTP_TIMEOUT_MS` (defaut: `30000`)
- `MCP_TRANSPORT` (`stdio` par defaut, `http` pour streamable HTTP)
- `MCP_HTTP_HOST` (defaut: `127.0.0.1`)
- `MCP_HTTP_PORT` (defaut: `3000`)
- `MCP_HTTP_PATH` (defaut: `/mcp`)

## Lancement

```bash
npm start
```

Ou en local:

```bash
npx openpaye-mcp-server
```

## Outils exposes

Le serveur expose un catalogue etendu de tools correspondant aux endpoints OpenPaye documentes:

- Absences (`get`, `periode`, `create`, `update`)
- Bulletins de paie (`liste`, `detail`, `liste par periode`)
- Cotisations (`CaisseCotisations`)
- Contrats (`list`, `get`, `create`, `update`, `delete`, `ContratSortant`)
- Dossiers (`list`, `get`, `create`, `update`, `delete`, `by siret`)
- Etablissements (`list`, `get`, `create`, `update`, `delete`)
- Heures supplementaires, NetEntreprise, Options, Primes (`create` + `update`)
- Salaries (`list`, `get`, `create`, `update`, `delete`)
- DSN, editions, solde tout compte, variables, variables bulletin, compteurs conges, variables reprise dossier

## Prompts MCP

Prompts pre-orchestres exposes:

- `paie_mensuelle`
- `controle_dossier`
- `onboarding_salarie`

## Packaging MCPB

La commande `npm run package:mcpb` enchaine : compilation TypeScript (`tsc`), **bundle** des dependances dans `dist/mcp-main.cjs` (esbuild, requis pour un `.mcpb` autonome sans `node_modules` dans l'archive), puis creation du zip `.mcpb` (voir `manifest.json`, point d'entree `dist/mcp-main.cjs`).

```bash
npm run package:mcpb
```

### Declencher la release sur GitHub

Le workflow [`.github/workflows/release.yml`](.github/workflows/release.yml) ne part **pas** sur un simple `git push` de branche. Il s'execute uniquement si :

1. Tu pousses un **tag** dont le nom commence par `v` (ex. `v0.1.0`), **ou**
2. Tu lances l'action a la main : onglet **Actions** du depot → workflow **Release** → **Run workflow** (`workflow_dispatch`).

Sans tag, le build release / piece jointe `.mcpb` ne sera pas cree par la CI.

### Husky : tag automatique au `git push` (optionnel)

Git **n’a pas** de hook `post-push`. Le comportement le plus proche est le hook **`pre-push`** (juste avant l’envoi au remote).

Si tu actives `"config": { "huskyAutoTag": true }` dans `package.json`, le script `.husky/pre-push` :

1. detecte un push vers **`main`** (modifiable avec `HUSKY_AUTO_TAG_BRANCH`, ex. `master`) ;
2. cree le tag **`v` + version** du `package.json` s’il n’existe pas localement (sur `HEAD`) ;
3. le **pousse vers `origin`** s’il n’existe pas encore sur le remote.

Ainsi un `git push origin main` peut declencher la CI release sans commande `git tag` separee. Desactive avec `"huskyAutoTag": false` (defaut).

## Workflow release locale

Preparer une release (versions + build + mcpb) :

```bash
npm run release:prepare -- patch
```

Puis commit, **creer le tag**, pousser branche **et** tag :

```bash
git add .
git commit -m "release: vX.Y.Z"
git tag vX.Y.Z
git push origin main && git push origin vX.Y.Z
```

Raccourci pour creer le tag a partir de `package.json` (apres `release:prepare` et commit) :

```bash
npm run release:tag
git push origin main && git push origin "v$(npm pkg get version | tr -d '"')"
```

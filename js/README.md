# c8-develop-workers-nodejs-lab

## Prerequisites

- [Node.js](https://nodejs.org/) v21 or later (v22 LTS recommended)
- npm (included with Node.js)

Verify that Node.js is installed:

```bash
node -v
```

You should see a version number like `v22.x.x`. If the command is not found or the version is below v21, install or update Node.js from [https://nodejs.org/](https://nodejs.org/) (pick the LTS version).

## Setup

Initialize the project and install the dependency:

```bash
npm init -y
npm pkg set type=module
npm i @camunda8/orchestration-cluster-api
```

Run the worker:

```bash
node src/worker.js
```

Copy the example configuration file and fill in your API credentials:

```bash
cp config-example.json config.json
```

Edit `config.json` with your values for `CAMUNDA_OAUTH_URL`, `CAMUNDA_REST_ADDRESS`, `CAMUNDA_CLIENT_ID`, and `CAMUNDA_CLIENT_SECRET`. Ideally you should have downloaded the Env Vars file ("CamundaCloudMgmtAPI-Client-....txt") when you created the credentials for your cluster. You can find the needed credential values there.




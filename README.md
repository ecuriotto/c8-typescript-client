# c8-develop-workers-nodejs-lab

## Prerequisites

- [Node.js](https://nodejs.org/) v21 or later (v22 LTS recommended)
- npm (included with Node.js)

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

Fill out config.json with your API credentials (`CAMUNDA_OAUTH_URL`, `CAMUNDA_REST_ADDRESS`, `CAMUNDA_CLIENT_ID`, `CAMUNDA_CLIENT_SECRET`). Ideally you should have downloaded the Env Vars file ("CamundaCloudMgmtAPI-Client-....txt") when you created the credentials for your cluster. You can find the needed credential values there.




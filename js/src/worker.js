import { createCamundaClient } from "@camunda8/orchestration-cluster-api";
import config from '../config.json' with { type: 'json' };   // API Credentials

const client = createCamundaClient({
    config: {
        CAMUNDA_REST_ADDRESS: config.CAMUNDA_REST_ADDRESS,
        CAMUNDA_AUTH_STRATEGY: "OAUTH",
        CAMUNDA_CLIENT_ID: config.CAMUNDA_CLIENT_ID,
        CAMUNDA_CLIENT_SECRET: config.CAMUNDA_CLIENT_SECRET,
        CAMUNDA_OAUTH_URL: config.CAMUNDA_OAUTH_URL,
        CAMUNDA_TOKEN_AUDIENCE: "zeebe.camunda.io",
    },
    log: { level: "info" },
});

(async () => {

    const topology = await client.getTopology();

    console.log(topology);

    client.createJobWorker({
        jobType: 'credit-deduction',
        jobTimeoutMs: 20000,
        maxParallelJobs: 1,
        workerName: 'credit-deduction-worker',
        jobHandler: creditDeduction
    })

    client.createJobWorker({
        jobType: 'credit-card-charging',
        jobTimeoutMs: 20000,
        maxParallelJobs: 1,
        workerName: 'credit-card-worker',
        jobHandler: creditCardCharging
    })


})()

async function creditDeduction(job) {

    console.log("Deducting customer credit...");
    var customerId = job.variables.customerId;
    var orderTotal = job.variables.orderTotal;
    var customerCredit = getCustomerCredit(customerId);
    var openAmount = deductCredit(orderTotal, customerCredit);
    
    await job.complete({ openAmount: openAmount , customerCredit: customerCredit });
}

async function creditCardCharging(job) {

    console.log("Charging card...");

    var cardNumber = job.variables.cardNumber;  
    var cvc = job.variables.cvc;
    var cardExpiry = job.variables.cardExpiry;
    var openAmount = job.variables.openAmount;

    chargeCreditCard(cardNumber, cvc, cardExpiry, openAmount);
    await job.complete();
}

/***** These are your "services". We will use these later in Exercise 6 *****/

function getCustomerCredit(customerId) {

      let credit = 0.0;

      const regEx = /\d+/;

      const match = customerId.match(regEx);

      if (match) { credit = parseFloat(match); }

      return credit;
}

function deductCredit(amount, credit) {

      let openAmount = 0.0;

      if (credit < amount) { openAmount = amount - credit; }

      return openAmount;
}

function chargeCreditCard(cardNumber, cvc, cardExpiry, amount) {
    console.log(`Charging card ${cardNumber}, with CVC ${cvc} and expiry ${cardExpiry}, for amount ${amount}`);
}

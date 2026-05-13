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
    console.log(`Customer ${customerId} has credit of ${customerCredit}. Open amount is ${openAmount}`);
    await job.complete({ openAmount: openAmount , customerCredit: customerCredit });
}

async function creditCardCharging(job) {

    console.log("Charging card...");

    var cardNumber = job.variables.cardNumber;
    var cvc = job.variables.cvc;
    var cardExpiry = job.variables.expiryDate;
    var openAmount = job.variables.openAmount;

    try {
        chargeCreditCard(cardNumber, cvc, cardExpiry, openAmount);
        await job.complete();
    } catch (error) {
        if (error.code === 'creditCardChargeError') {
            console.error(`Credit card charge error: ${error.message}`);
            await job.error({ errorCode: error.code, errorMessage: error.message });
        } else {
            await job.fail({ errorMessage: error.message, retries: job.retries - 1, retryBackOff: 0 });
        }
    }
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
console.log(`Deducting credit ${credit} from amount ${amount}`);
      if (credit < amount) { openAmount = amount - credit; }

      return openAmount;
}

function chargeCreditCard(cardNumber, cvc, cardExpiry, amount) {
    if (cardExpiry.length !== 5) {
        const err = new Error(`Invalid card expiry: ${cardExpiry}. Expected format MM/YY (5 characters).`);
        err.code = 'creditCardChargeError';
        throw err;
    }
    console.log(`Charging card ${cardNumber}, with CVC ${cvc} and expiry ${cardExpiry}, for amount ${amount}`);
}

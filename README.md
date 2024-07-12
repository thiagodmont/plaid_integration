# Setup

## 1. Install the dependencies in each of the projects.
- 1. Go to node (backend) and do `npm install`
- 2. Go to frontend and do `npm install`

## 2. Set up your environment variables

You should have and account with Plaid, if you don't have one please create one in [https://dashboard.plaid.com/signup](https://dashboard.plaid.com/signup) 

```bash
cp .env.example .env
```

Copy `.env.example` to a new file called `.env` and fill out the environment variables inside. At
minimum `PLAID_CLIENT_ID` and `PLAID_SECRET` must be filled out. Get your Client ID and secrets from
the dashboard: [https://dashboard.plaid.com/developers/keys](https://dashboard.plaid.com/developers/keys)

> NOTE: `.env` files are a convenient local development tool. Never run a production application
> using an environment file with secrets in it.

## 3. Running the backend

The backend with be running on http://localhost:8000

```bash
$ cd node
$ npm start
```

Or if you want to enable the watch mode

```bash
$ cd node
$ npm run watch
```

## 4. Running the tests in the backend (node)

```bash
$ cd node
$ npm test
```

## 5. Running the frontend

The frontend with be running on http://localhost:3000

```bash
$ cd frontend
$ npm start
```

## 6. Test credentials

In Sandbox, you can log in to any supported institution (except Capital One) using `user_good` as the username and `pass_good` as the password. If prompted to enter a 2-factor authentication code, enter `1234`.

# For a fast development interaction

I created the `/api/use_access_token`endpoint to set an access_token and do not need to do authentication everytime. It is a POST request and need the token in the body.

Example of the JSON body:
```bash
{ "access_token": "access-sandbox-1234xxxx" }
```

# Testing the score endpoint

After starting both the backend and frontend, you will be able to go to the endpoint http://localhost:3000 and see the "Link page" where you will be able to link your account.

Click the "Launch Link" button and follow all the steps for authentication.

After successful authentication, you will be redirected to a page where you will find some endpoints. Search for the `Score` endpoint and click the "Send request" button. Wait for the response, and the result will be displayed in a table below.

# Explanation about the solution

The challenge is to calculate the fiscal responsibility score and return the percentage of time during the year that a checking account remained positive.

For this, I created the `/api/score` API that uses the `/transactions/get` endpoint from Plaid. I decided to use `/transactions/get` instead of `/transactions/sync` because with `/transactions/get`, we can set a date range.

The first step was getting all the data from the checking account.

> Note: Plaid's implementation uses positive values for money that goes out and negative values for money that comes in. 
> They explain in the documentation that the goal is to normalize the data between checking and credit-type accounts.

After getting all the transactions and the current balance for the checking account, I started to re-create the previous balance for each transaction, which gave me the historical balance for the account.

> Note: For now, I didn't include the initial balance in the calculation. It can easily be included in the future if needed.

I went through the historical balance and calculated each time the account was positive, then divided by the number of transactions made by the customer during the year. This gave me the percentage of times the account was positive for every transaction.

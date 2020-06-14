import Web3 from 'web3';
import express from 'express';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';

const config = Config['localhost'];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
const oracleCount = 20;
const oracles = [];
const STATUS_CODES = [0, 10, 20, 30, 40, 50];

async function setup(){
  const accounts = await web3.eth.getAccounts();
  registerOracles(accounts.slice(1, oracleCount + 1));

  flightSuretyApp.events.OracleRequest({ fromBlock: 0 }, function (error, event) {
    console.log(`evetn-  ${JSON.stringify(event)}`)
    if (error) {
      return console.log(error);
    }
    if (!event.returnValues) {
      return console.error("No return values");
    }
    
    const { returnValues } = event;
  
    fetchFlightStatus( returnValues.index, returnValues.airline,
                            returnValues.flight, returnValues.timestamp);
  });
}

async function registerOracles(account){
  // ARRANGE
  const fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

  for(let i = 0; i < oracleCount; i++) {
    await config.flightSuretyApp.registerOracle({ from: accounts[i], value: fee });
    const indexes = await config.flightSuretyApp.getMyIndexes.call({from: accounts[i]});
    //add random flight status to oracle
    const statusCode = STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)];
    oracles.push({address, indexes, statusCode});

    console.log(`Oracle: ${address} indexes: ${result[0]}, ${result[1]}, ${result[2]}
        statusCode: ${statusCode}`);
  }
}

async function fetchFlightStatus(index, airline, flight, timestamp){
  console.log(`Fetch flight status for - `);
  console.log(index, airline, flight, timestamp);

  const indexMatchingOracles = [];

  oracles.forEach((oracle) => {
    if(oracle.indexes.includes(index)){
      flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, oracle.statusCode)
      .send({ from: oracle.address, gas: 5555555 })
      .then(() => {
          console.log("Oracle responded with " + oracle.statusCode);
      })
      .catch((err) => console.log("Oracle response rejected"));
    }
  });
}

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with Dapp!'
    })
})

setup();


export default app;



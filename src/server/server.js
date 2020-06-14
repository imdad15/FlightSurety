import Web3 from 'web3';
import express from 'express';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';

const config = Config['localhost'];
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
const oraclesCount = 20;
const oracles = [];
const STATUS_CODES = [0, 10, 20, 30, 40, 50];

web3.eth.getAccounts((error, accounts) => {
  for(let a = 0; a < oraclesCount; a++) {
    flightSuretyApp.methods.registerOracle().send({from: accounts[a], value: web3.utils.toWei("1",'ether'), gas: 9999999}, (error, result) => {
      flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]}, (error, indexes) => {
        const statusCode = STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)];
        console.log(`indexes- ${JSON.stringify(indexes)}`)
        const oracle = {address: accounts[a], indexes: indexes, statusCode: statusCode};
        oracles.push(oracle);
        console.log("ORACLE REGISTERED: " + JSON.stringify(oracle));
      });
    });
  }
});

flightSuretyApp.events.OracleRequest({fromBlock: 0}, function (error, event) {
  const {returnValues} = event;
    let index = returnValues.index;
    for(let a = 0; a < oracles.length; a++) {
      console.log(`oracleReq- ${JSON.stringify(oracles[a])}`);

      // if(oracles[a].indexes.includes(index)) {
      //   flightSuretyApp.methods.submitOracleResponse(index, returnValues.airline, returnValues.flight, returnValues.timestamp, oracles[a].statusCode)
      //   .send({from: oracles[a].address, gas: 9999999}, (error, result) => {
      //     console.log("FROM " + JSON.stringify(oracles[a]) + "STATUS CODE: " + statusCode);
      //   });
      // }
    }
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with Dapp!'
    })
})

export default app;



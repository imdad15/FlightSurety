import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [];
        this.flights.push({"ZS411": Math.floor(Date.now() / 1000)})
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    registerFlight(flight, callback){
        const timestamp = Math.floor(Date.now() / 1000);
        let payload = {
            flight: flight,
            timestamp: timestamp
        } 
        this.flights.push(payload);
        let self = this;
        self.flightSuretyApp.methods
            .registerFlight(self.airlines[0], flight, timestamp)
            .call({from: self.airlines[0], gas: 3000000}, (error, result) => callback(error, payload));
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        const registeredFlight = this.flights.find(flightTimestamp => flightTimestamp.flight === flight);
        if(registeredFlight){
            let payload = {
                airline: self.airlines[0],
                flight: flight,
                timestamp: registeredFlight.timestamp
            } 
            self.flightSuretyApp.methods
                .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
                .send({ from: payload.airline, gas: 3000000}, (error, result) => {
                    callback(error, payload);
                });
        }
    }

    buyInsurance(flight, insuranceValue, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
        }
        self.flightSuretyApp.methods
            .buyInsurance(payload.airline, payload.flight)
            .send({from: self.passengers[0], value: this.web3.utils.toWei(insuranceValue, "ether"), gas: 3000000}, (error, result) => {
                callback(error, result);
            });
    }

    withdrawCredits(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .withdrawCredits()
            .send({ from: self.passengers[0], gas: 3000000}, (error, result) => {
                callback(error, result);
            });
    }
}

var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const Web3 = require('web3');

contract('Flight Surety Tests', async (accounts) => {
    var config;
    const secondAirline = accounts[2];
    const thirdAirline = accounts[3];
    
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
                
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);
    });


    it("first airline is registered and a stakeholder when contract is deployed", async () => {
        const isRegistered = await config.flightSuretyData.isRegistered.call(config.firstAirline);
        
        assert.equal( isRegistered, true, "First airline is not registered");
    
        const isStakeholder = await config.flightSuretyData.hasStakes.call(config.firstAirline);
        assert.equal(isStakeholder, true, "First airline is not a stakeholder");
    });

    it("(airline) can register another airline", async () => {
        try {
            await config.flightSuretyApp.registerAirline(secondAirline, { from: config.firstAirline });
        } catch(e) {
        }
        const isRegistered = await config.flightSuretyData.isRegistered.call(secondAirline);
        assert.equal( isRegistered, true, "Registered airline failed to add new airline");
    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
        // ARRANGE
        let accessDenied = false;
        // ACT
        try {
            await config.flightSuretyApp.registerAirline(thirdAirline, {from: secondAirline});
        }
        catch(e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true,  "Airline should not be able to register another airline if it hasn't provided funding");
    });
 
    it('(airline) should be able to add stakes once it is registered', async () => {

        try {
            await config.flightSuretyApp.addStake({from: secondAirline, value: Web3.utils.toWei('10', "ether"), gasPrice: 0});
        }
        catch(e) {
        }
        const secondAirlineStake = await config.flightSuretyData.hasStakes.call(secondAirline); 
       
        assert.equal(secondAirlineStake, true, "Airline should be able to add stakes once it has been registered");
    });


    it('Adding a new (airline) will require consensus of at least 50% reigstered airlines,once 4 or more airlines are registered', async () => {
        
        // ARRANGE
        const fourthAirline = accounts[4];
        const fifthAirline = accounts[5];

        // register third airline
        await config.flightSuretyApp.registerAirline(thirdAirline, {from: secondAirline});
        await config.flightSuretyApp.addStake({from: thirdAirline, value: Web3.utils.toWei('10', "ether"), gasPrice: 0});

        //  register fourth airline
        await config.flightSuretyApp.registerAirline(fourthAirline, {from: secondAirline});
        await config.flightSuretyApp.addStake({from: fourthAirline, value: Web3.utils.toWei('10', "ether"), gasPrice: 0});

        //register fifth airline. It shouldnt register until multiconsensus is reached
        await config.flightSuretyApp.registerAirline(fifthAirline, {from: secondAirline});
        let isRegistered = await config.flightSuretyData.isRegistered.call(fifthAirline); 
        // ASSERT
        assert.equal(isRegistered, false, "Airline should not be registered until multiconsesus has reached");

        await config.flightSuretyApp.registerAirline(fifthAirline, {from: thirdAirline});
        isRegistered = await config.flightSuretyData.isRegistered.call(fifthAirline); 
        assert.equal(isRegistered, true, "Airline should be registered as multiconsesus has reached");
    });


});

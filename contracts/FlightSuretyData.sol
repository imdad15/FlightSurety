// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false


    struct Flight {
        string flightName;
        address airline;
        uint8 statusCode;
        uint256 timestamp;
    }

    struct Airline {
        bool isRegistered;
        bool isStakeHolder;
    }

    struct Insurance {
        address passengerID;
        uint8 value;
    }

    mapping (address => Airline) private airlines;
    mapping (bytes32 => Flight) private flights;
    mapping (bytes32 => Insurance) private insurances; 
    mapping (address => bool) private authorisedCallers;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    event AIRLINE_REGISTERED(address airlineID);

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * Modifier that requires the "operational" boolean variable to be "true"
    * This is used on all state changing functions to pause the contract in
    * the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * Modifier that requires the function caller to be from list of authorised accounts
    */
    modifier requireIsAuthorisedCaller() {
        require(authorisedCallers[msg.sender] == true, 'The caller is not authorized');
        _;
    }

     /**
    * Modifier that requires the function caller to be from list of authorised accounts
    */
    modifier requireIsStakeholder() {
        require(airlines[msg.sender].isStakeHolder == true, 'The caller is not authorized');

        _;
    }


    /********************************************************************************************/
    /*                                         CONSTRUCTOR                                      */
    /********************************************************************************************/
   
    /**
    * Constructor
    * The deploying account will be initially registered as authorised caller
    * The deploying account becomes contractOwner
    *
    * The deploying account will register the first airline.
    */
    constructor(address airlineAddress)
    public {
        contractOwner = msg.sender;
        authorisedCallers[msg.sender] = true;
        
        airlines[airlineAddress].isRegistered = true;
        airlines[airlineAddress].isStakeHolder = true;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
    public
    view
    returns(bool) {
        return operational;
    }

    /**
    * Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus (bool mode)
    external
    requireContractOwner() {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * Add an authorised caller.
    * Can only be called from FlightSuretyApp contract
    */
     function authorizeCaller(address caller) external requireContractOwner {
        authorisedCallers[caller] = true;
    }


    /**
    * Disable authorised caller.
    * Can only be called from FlightSuretyApp contract
    */
    function deauthorizeCaller(address caller) external requireContractOwner {
        authorisedCallers[caller] = false;
    }

   /**
    * Register an airline.
    * Can only be called from FlightSuretyApp contract
    */
    function registerAirline(address airlineAddress)
    external
    requireIsOperational(){
        //airlines[airlineAddress].airlineName = airlineName;
        airlines[airlineAddress].isRegistered = true;
    }

    /**
    * Check if airline is Added, i.e. Airline is added, but not participating yet.
    * Can only be called from FlightSuretyApp contract
    */
    function isRegistered(address airlineAddress)
    external
    view
    requireIsOperational() 
    returns (bool) {
        return airlines[airlineAddress].isRegistered;
    }


    /**
    * Enable the airline to participate once they have put in their required stakes.
    * Can only be called from FlightSuretyApp contract
    */
    function addStake(address airlineAddress)
    external
    payable
    requireIsOperational() {
        airlines[airlineAddress].isStakeHolder = true;
    }


    /**
    * Check if airline has stakes, i.e. Airline satisfies requirement to be participant
    * Can only be called from FlightSuretyApp contract
    */
    function hasStakes(address airlineAddress)
    external
    view
    requireIsOperational() 
    returns (bool) {
        return airlines[airlineAddress].isStakeHolder;
    }


    /**
    * Register a flight
    */
    function registerFlight( 
                                address airline,
                                string calldata flightName,
                                uint256 timestamp
                            )
    external {
        bytes32 flightKey =getFlightKey(airline, flightName, timestamp);
        flights[flightKey].flightName = flightName;   
        flights[flightKey].airline = airline;
        flights[flightKey].statusCode = 0;
        flights[flightKey].timestamp = timestamp;
    } 

    /**
    * Update a flight status
    */
    function updateFlightStatus( 
                                address airline,
                                string calldata flightName,
                                uint256 timestamp,
                                uint8 statusCode
                            )
    external {
        bytes32 flightKey =getFlightKey(airline, flightName, timestamp);
        require(flights[flightKey].airline == airline, "Only flight owning airline can change a flights status");
        flights[flightKey].statusCode = statusCode;
    } 

    /**
    * Buy insurance for a flight
    */
    function buyInsurance (
                            address airline,
                            string calldata flight 
                        )
    external
    payable {
        
    }

    /**
    * Credits payouts to insurees
    */
    function creditInsurees ()
    external
    pure {
    }
    

    /**
    * Transfers eligible payout funds to insuree
    *
    */
    function pay
                            (
                            )
                            external
                            pure
    {
    }

    /**
    * Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (
                            )
                            public
                            payable
    {
    }

    /**
    * Create flight key
    */
    function getFlightKey(
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
    internal
    returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * Fallback function for funding smart contract.
    *
    */
    fallback()
    external {
        fund();
    }
}


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


    struct Airline {
        string airlineName;
        bool isAdded;
        bool isParticipant;
        string[] flights;
    }

    mapping (address => Airline) private airlines;
    mapping (address => bool) private authorisedCallers;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


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
    modifier requireAirlineIsAdded() {
        require(airlines[msg.sender].isAdded == true, 'The caller is not authorized');
        _;
    }


    /********************************************************************************************/
    /*                                         CONSTRUCTOR                                      */
    /********************************************************************************************/
   
    /**
    * Constructor
    * The creater of the contract will be initially registered as authorised caller
    * The deploying account becomes contractOwner
    */
    constructor()
    public {
        contractOwner = msg.sender;
        authorisedCallers[msg.sender] = true;
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
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                            )
                            external
                            pure
    {
    }


   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
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
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
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

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}


import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        // Register new flight
        DOM.elid('register-flight').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.registerFlight(flight, (error, result) => {
                console.log(`res- ${JSON.stringify(result)} err- ${JSON.stringify(error)}`);
                display('Flights', 'Register Flight', [ { label: 'Registered flight', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                console.log(`res- ${JSON.stringify(result)}`);
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flight = DOM.elid("flight-number").value;
            let insuranceValue = DOM.elid('insurance-value').value;
            contract.buyInsurance(flight, insuranceValue, (error, result) => {
                display('Passenger', 'Buy insurance', [ { label: 'Transaction', error: error, value: result} ]);
            });
        })

        DOM.elid('withdraw-credits').addEventListener('click', () => {
            contract.withdrawCredits((error, result) => {
                display('Passenger', 'Withdraw credits', [ { label: 'Transaction', error: error, value: result} ]);
            });
        })
    
    });
})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    if (results[0].label === 'Operational status') {
        displayDiv.append(section);
    } else {
    displayDiv.innerHTML = '';
    displayDiv.append(section);
    }
}
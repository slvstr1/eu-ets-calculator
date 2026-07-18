import React, { useState, useEffect } from "react";

import Calculator from "./components/Calculator.jsx";


function App() {

    return (
        <div className="page">

            <div className="container">

                <header className="header">

                    <h2>
                        EU ETS Price Containment Mechanism Calculator
                    </h2>

                    <h4>
                        This calculator determines the relationship between
                        the legal parameters of EU ETS price containment
                        mechanisms and the maximum constant permit price
                        growth that can occur without triggering intervention.
                    </h4>

                    <h4>
                        Modify the multiplier or the maximum constant growth
                        factor. The calculator solves for the corresponding
                        value while keeping the Reference Period and Recent
                        Comparison Period fixed.
                    </h4>

                </header>


                <Calculator />

            </div>

        </div>
    );
}


export default App;
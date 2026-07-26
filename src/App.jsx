import React from "react";
import Header from "./components/Header.jsx";
import Calculator from "./components/Calculator.jsx";


function App() {

    return (
        <div className="page">

            <div className="container">

                {/*<header className="header">*/}

                {/*    <h2>*/}
                {/*        EU ETS Price Containment Mechanism Calculator*/}
                {/*    </h2>*/}

                {/*    <h4>*/}
                {/*        This calculator determines the relationship between*/}
                {/*        the legal parameters of EU ETS price containment*/}
                {/*        mechanisms and the maximum constant permit price*/}
                {/*        growth that can occur without triggering intervention.*/}
                {/*    </h4>*/}

                {/*    <h4>*/}
                {/*        Modify any of the fields and the calculator solves for the corresponding*/}
                {/*        values of the other fields.*/}
                {/*    </h4>*/}

                {/*    <h5>Accompanying the paper Silvester van Koten, 2026. "The Effectiveness of EU ETS Price Containment Mechanisms against  rapid price increases: A Quantitative Analysis"*/}
                {/*    </h5>*/}
                {/*</header>*/}
             <Header />

                <Calculator />


            </div>

        </div>
    );
}


export default App;
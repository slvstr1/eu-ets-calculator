import React from "react";


function ResultCard({
    annualFactor,
    annualRate
}) {

    return (

        <div className="result-card">

            <h2>
                Annual implication
            </h2>


            <div className="result-row">

                <div>

                    <span className="result-label">
                        Annual price factor
                    </span>

                    <strong>
                        {annualFactor.toFixed(2)}
                    </strong>

                </div>


                <div>

                    <span className="result-label">
                        Annual growth rate
                    </span>

                    <strong>
                        {(annualRate * 100).toFixed(1)}%
                    </strong>

                </div>

            </div>

        </div>

    );

}


export default ResultCard;
import React, { useState, useEffect } from "react";

import ParameterInput from "./ParameterInput.jsx";
import ResultCard from "./ResultCard.jsx";

import {
    solveForGrowthFactor,
    solveForMultiplier,
    annualFactor,
    annualGrowthRate
} from "../utils/solver.js";


function Calculator() {

    const [referencePeriod, setReferencePeriod] = useState(24);
    const [comparisonPeriod, setComparisonPeriod] = useState(6);

    const [multiplier, setMultiplier] = useState(2.4);
    const [growthFactor, setGrowthFactor] = useState(1.0665);

    const [lastEdited, setLastEdited] = useState("multiplier");


    /*
        Recalculate after 500 ms.
        Reference Period and Comparison Period
        are never calculated automatically.
    */
    useEffect(() => {

        const timer = setTimeout(() => {

            if (lastEdited === "multiplier") {

                const result = solveForGrowthFactor(
                    multiplier,
                    referencePeriod,
                    comparisonPeriod
                );

                setGrowthFactor(result);

            }


            if (lastEdited === "growthFactor") {

                const result = solveForMultiplier(
                    growthFactor,
                    referencePeriod,
                    comparisonPeriod
                );

                setMultiplier(result);

            }

        }, 500);


        return () => clearTimeout(timer);

    }, [
        multiplier,
        growthFactor,
        referencePeriod,
        comparisonPeriod,
        lastEdited
    ]);



    function handleMultiplier(value) {

        const number = Number(value);

        if (!isNaN(number)) {
            setMultiplier(number);
            setLastEdited("multiplier");
        }

    }


    function handleGrowthFactor(value) {

        const number = Number(value);

        if (!isNaN(number)) {
            setGrowthFactor(number);
            setLastEdited("growthFactor");
        }

    }



    const yearlyFactor = annualFactor(growthFactor);

    const yearlyRate = annualGrowthRate(growthFactor);



    return (

        <div className="calculator">


            <div className="parameter-row">


                <ParameterInput
                    title="Multiplier (m)"
                    value={multiplier}
                    onChange={handleMultiplier}
                />


                <ParameterInput
                    title="Reference Period (months)"
                    value={referencePeriod}
                    onChange={(e) =>
                        setReferencePeriod(Number(e.target.value))
                    }
                />


                <ParameterInput
                    title="Recent Comparison Period (months)"
                    value={comparisonPeriod}
                    onChange={(e) =>
                        setComparisonPeriod(Number(e.target.value))
                    }
                />


            </div>



            <div className="growth-box">


                <ParameterInput
                    title="Maximum constant growth factor (r)"
                    value={growthFactor}
                    onChange={handleGrowthFactor}
                />


            </div>



            <ResultCard
                annualFactor={yearlyFactor}
                annualRate={yearlyRate}
            />


        </div>

    );

}


export default Calculator;
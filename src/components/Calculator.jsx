import React, { useState, useEffect, useMemo } from "react";

import ParameterInput from "./ParameterInput.jsx";
import ResultCard from "./ResultCard.jsx";

import {
    solveForGrowthFactor,
    solveForMultiplier,
    annualFactor,
    annualGrowthRate
} from "../utils/solver.js";


const presets = {

    custom: {
        name: "Custom",
        multiplier: 2.4,
        referencePeriod: 24,
        comparisonPeriod: 6
    },

    ets1: {
        name: "ETS1 Article 29a",
        multiplier: 2.4,
        referencePeriod: 24,
        comparisonPeriod: 6
    },

    ets2early: {
        name: "ETS2 2027–2028",
        multiplier: 1.5,
        referencePeriod: 6,
        comparisonPeriod: 3
    },

    ets2small: {
        name: "ETS2 2029+ (50 million permits)",
        multiplier: 2,
        referencePeriod: 6,
        comparisonPeriod: 3
    },

    ets2large: {
        name: "ETS2 2029+ (150 million permits)",
        multiplier: 3,
        referencePeriod: 6,
        comparisonPeriod: 3
    }

};



function Calculator() {


    const [referencePeriod, setReferencePeriod] =
        useState(24);

    const [comparisonPeriod, setComparisonPeriod] =
        useState(6);


    const [multiplier, setMultiplier] =
        useState(2.4);


    const [growthFactor, setGrowthFactor] =
        useState(1.0665);


    const [lastEdited, setLastEdited] =
        useState("multiplier");


    const [preset, setPreset] =
        useState("ets1");



    /*
        Apply preset values
    */

    function applyPreset(key) {

        const p = presets[key];

        setPreset(key);

        setMultiplier(p.multiplier);

        setReferencePeriod(p.referencePeriod);

        setComparisonPeriod(p.comparisonPeriod);

        setLastEdited("multiplier");

    }



    /*
        Recalculate after 500 ms
    */

    useEffect(() => {


        const timer = setTimeout(() => {


            if (lastEdited === "multiplier") {


                const result =
                    solveForGrowthFactor(
                        multiplier,
                        referencePeriod,
                        comparisonPeriod
                    );


                setGrowthFactor(result);

            }



            if (lastEdited === "growthFactor") {


                const result =
                    solveForMultiplier(
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

        setMultiplier(Number(value));

        setLastEdited("multiplier");

        setPreset("custom");

    }



    function handleGrowthFactor(value) {

        setGrowthFactor(Number(value));

        setLastEdited("growthFactor");

        setPreset("custom");

    }



    // const yearlyFactor =
    //     annualFactor(growthFactor);
    const yearlyFactor = useMemo(
    () => annualFactor(growthFactor),
    [growthFactor]
);

    // const yearlyRate =
    //     annualGrowthRate(growthFactor);
    const yearlyRate = useMemo(
    () => annualGrowthRate(growthFactor),
    [growthFactor]
);



    return (

        <div className="calculator">


            <div className="preset">

                <label>
                    Select EU ETS mechanism
                </label>


                <select
                    value={preset}
                    onChange={(e) =>
                        applyPreset(e.target.value)
                    }
                >

                    {
                        Object.entries(presets)
                        .map(([key, value]) => (

                            <option
                                key={key}
                                value={key}
                            >
                                {value.name}
                            </option>

                        ))
                    }

                </select>


            </div>




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
                        setReferencePeriod(
                            Number(e)
                        )
                    }
                />



                <ParameterInput
                    title="Recent Comparison Period (months)"
                    value={comparisonPeriod}
                    onChange={(e) =>
                        setComparisonPeriod(
                            Number(e)
                        )
                    }
                />


            </div>





            <div className="growth-box">


                <ParameterInput
                    title="Maximum continuous growth factor (r)"
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
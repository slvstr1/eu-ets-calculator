import React, {useState, useEffect, useMemo} from "react";

import ParameterInput from "./ParameterInput.jsx";
// import ResultCard from "./ResultCard.jsx";

import {
    solveForGrowthFactor, solveForMultiplier, annualFactor, annualGrowthRate, monthlyFactorFromAnnualFactor
} from "../utils/solver.js";

const TIMEOUTCALC = 750
const presets = {
    custom: {
        name: "Custom", multiplier: 2.4, referencePeriod: 24, comparisonPeriod: 6
    }, ets1: {
        name: "ETS1 Article 29a", multiplier: 2.4, referencePeriod: 24, comparisonPeriod: 6
    }, ets2early: {
        name: "ETS2 2027–2028", multiplier: 1.5, referencePeriod: 6, comparisonPeriod: 3
    }, ets2small: {
        name: "ETS2 2029+ (50 million permits)", multiplier: 2, referencePeriod: 6, comparisonPeriod: 3
    }, ets2large: {
        name: "ETS2 2029+ (150 million permits)", multiplier: 3, referencePeriod: 6, comparisonPeriod: 3
    }
};

function Calculator() {
    const [activeField, setActiveField] = useState(null);
    const [preset, setPreset] = useState("ets1");
    const [values, setValues] = useState({
        "Multiplier (m)": "2.4",
        "Reference Period (months)": "24",
        "Recent Comparison Period (months)": "6",
        "Maximum monthly constant growth factor (r)": "1.0665",
        "Annual price factor": "2.16"
    });


    /*
        Apply preset values
    */

    function applyPreset(key) {
        const p = presets[key];
        setPreset(key);
        setValues({
            "Multiplier (m)": String(p.multiplier),
            "Reference Period (months)": String(p.referencePeriod),
            "Recent Comparison Period (months)": String(p.comparisonPeriod),
            "Maximum monthly constant growth factor (r)": "1.0665"
        });

        setActiveField("Multiplier (m)");
    }

    useEffect(() => {
        if (!activeField) {
            return;
        }

        const timer = setTimeout(() => {
            if (values["Multiplier (m)"] === "" || values["Maximum monthly constant growth factor (r)"] === "" || values["Reference Period (months)"] === "" || values["Recent Comparison Period (months)"] === "") {
                return;
            }

            const multiplier = Number(values["Multiplier (m)"]);
            const referencePeriod = Number(values["Reference Period (months)"]);
            const comparisonPeriod = Number(values["Recent Comparison Period (months)"]);

            if (activeField === "Multiplier (m)") {
                const result = solveForGrowthFactor(multiplier, referencePeriod, comparisonPeriod);
                setValues(prev => ({
                    ...prev, "Maximum monthly constant growth factor (r)": result.toFixed(4)
                }));

            }
            if (activeField === "Maximum monthly constant growth factor (r)") {

                const result = solveForMultiplier(Number(values["Maximum monthly constant growth factor (r)"]), referencePeriod, comparisonPeriod);

                setValues(prev => ({
                    ...prev, "Multiplier (m)": result.toFixed(2)
                }));
            }
            if (activeField === "Annual price factor") {

                const monthly = monthlyFactorFromAnnualFactor(Number(values["Annual price factor"]));

                const result = solveForMultiplier(monthly, referencePeriod, comparisonPeriod);

                setValues(prev => ({
                    ...prev,
                    "Maximum monthly constant growth factor (r)": monthly.toFixed(4),
                    "Multiplier (m)": result.toFixed(2)
                }));
            }
        }, TIMEOUTCALC);
        return () => clearTimeout(timer);
    }, [values, activeField]);

    function handleFocus(title) {
        setActiveField(title);
    }

    function handleChange(title, value) {
        setValues(prev => ({
            ...prev, [title]: value
        }));
    }


    const yearlyFactor = useMemo(() => annualFactor(Number(values["Maximum monthly constant growth factor (r)"])), [values]);

    const yearlyRate = useMemo(() => annualGrowthRate(Number(values["Maximum monthly constant growth factor (r)"])), [values]);


    return (

        <div className="calculator">


            <div className="preset">

                <label>
                    Select EU ETS mechanism
                </label>


                <select
                    value={preset}
                    onChange={(e) => applyPreset(e.target.value)}
                >

                    {Object.entries(presets)
                        .map(([key, value]) => (

                            <option
                                key={key}
                                value={key}
                            >
                                {value.name}
                            </option>

                        ))}
                </select>
            </div>

            <div className="parameter-row">
                <ParameterInput
                    title="Multiplier (m)"
                    value={values["Multiplier (m)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step="0.01"
                />


                <ParameterInput
                    title="Reference Period (months)"
                    value={values["Reference Period (months)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step="1"
                />

                <ParameterInput
                    title="Recent Comparison Period (months)"
                    value={values["Recent Comparison Period (months)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step="1"
                />


            </div>

            <div className="growth-box">

                <ParameterInput
                    title="Maximum monthly constant growth factor (r)"
                    value={values["Maximum monthly constant growth factor (r)"]}
                    // decimals={4}
                    step="0.0001"
                    onChange={handleChange}
                    onFocus={handleFocus}
                />
            </div>

            {/*<ParameterInput*/}
            {/*    title="Annual price factor"*/}
            {/*    // value={values["Annual price factor"]}*/}
            {/*    value={yearlyFactor}*/}
            {/*    decimals={2}*/}
            {/*    step="0.01"*/}
            {/*    // onChange={handleChange}*/}
            {/*    // onFocus={handleFocus}*/}
            {/*    readOnly={true}*/}
            {/*/>*/}
            <ParameterInput
                title="Annual price factor"
                value={values["Annual price factor"]}
                onChange={handleChange}
                onFocus={handleFocus}
                step="0.01"
            />

            <ParameterInput
                title="Annual growth rate (%)"
                value={yearlyRate * 100}
                decimals={2}
                step="0.0001"
                readOnly={true}
            />
        </div>);
}



export default Calculator;
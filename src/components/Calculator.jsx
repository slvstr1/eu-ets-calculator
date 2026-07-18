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
    const [highlightFields, setHighlightFields] = useState([]);
    const [preset, setPreset] = useState("ets1");
    const [values, setValues] = useState({
        "Multiplier (m)": "2.4",
        "Reference Period (months)": "24",
        "Recent Comparison Period (months)": "6",
        "Maximum monthly constant growth factor (r)": "1.0665",
        "Annual price factor": "2.16"
    });

    function updateCalculatedFields(updates) {
        setValues(prev => ({
            ...prev,
            ...updates
        }));

        setHighlightFields(Object.keys(updates));

        setTimeout(() => {
            setHighlightFields([]);
        }, 1000);
    }

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
                const nextGrowth = result.toFixed(4);
                const nextAnnual = annualFactor(result).toFixed(2);

                // Check if values actually changed before triggering state update
                if (
                    values["Maximum monthly constant growth factor (r)"] !== nextGrowth ||
                    values["Annual price factor"] !== nextAnnual
                ) {
                    updateCalculatedFields({
                        "Maximum monthly constant growth factor (r)": nextGrowth,
                        "Annual price factor": nextAnnual
                    });
                }
            }
            if (activeField === "Maximum monthly constant growth factor (r)") {
                const growth = Number(values["Maximum monthly constant growth factor (r)"]);
                const result = solveForMultiplier(growth, referencePeriod, comparisonPeriod);
                const nextMultiplier = result.toFixed(2);
                const nextAnnual = annualFactor(growth).toFixed(2);

                // Check if values actually changed before triggering state update
                if (
                    values["Multiplier (m)"] !== nextMultiplier ||
                    values["Annual price factor"] !== nextAnnual
                ) {
                    updateCalculatedFields({
                        "Multiplier (m)": nextMultiplier,
                        "Annual price factor": nextAnnual
                    });
                }
            }
            if (activeField === "Annual price factor") {
                const monthly = monthlyFactorFromAnnualFactor(Number(values["Annual price factor"]));
                const result = solveForMultiplier(monthly, referencePeriod, comparisonPeriod);
                const nextGrowth = monthly.toFixed(4);
                const nextMultiplier = result.toFixed(2);

                // Check if values actually changed before triggering state update
                if (
                    values["Maximum monthly constant growth factor (r)"] !== nextGrowth ||
                    values["Multiplier (m)"] !== nextMultiplier
                ) {
                    updateCalculatedFields({
                        "Maximum monthly constant growth factor (r)": nextGrowth,
                        "Multiplier (m)": nextMultiplier
                    });
                }
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
    const yearlyRate = useMemo(() => annualGrowthRate(Number(values["Maximum monthly constant growth factor (r)"])).toFixed(2), [values]);

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
                    highlight={highlightFields.includes("Multiplier (m)")}
                />

                <ParameterInput
                    title="Reference Period (months)"
                    value={values["Reference Period (months)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step="1"
                    highlight={highlightFields.includes("Reference Period (months)")}
                />

                <ParameterInput
                    title="Recent Comparison Period (months)"
                    value={values["Recent Comparison Period (months)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step="1"
                    highlight={highlightFields.includes("Recent Comparison Period (months)")}
                />
            </div>

            <div className="growth-box">
                <ParameterInput
                    title="Maximum monthly constant growth factor (r)"
                    value={values["Maximum monthly constant growth factor (r)"]}
                    step="0.001"
                    onChange={handleChange}
                    onFocus={handleFocus}
                    highlight={highlightFields.includes("Maximum monthly constant growth factor (r)")}
                />
            </div>

            <ParameterInput
                title="Annual price factor"
                value={values["Annual price factor"]}
                onChange={handleChange}
                onFocus={handleFocus}
                step="0.01"
                highlight={highlightFields.includes("Annual price factor")}
            />

            <ParameterInput
                title="Annual growth rate (%)"
                value={(yearlyRate * 100).toFixed(2)}
                decimals={2}
                step="0.0001"
                readOnly={true}
                highlight={highlightFields.includes("Annual price factor")}
            />
        </div>
    );
}

export default Calculator;
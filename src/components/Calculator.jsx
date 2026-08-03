import React, { useState, useEffect, useMemo } from "react";
import ParameterInput from "./ParameterInput.jsx";
import PriceGraph from "./PriceGraph.jsx";

import {
    solveForGrowthFactor,
    solveForMultiplier,
    annualFactor,
    annualGrowthRate,
    monthlyFactorFromAnnualFactor
} from "../utils/solver.js";

const TIMEOUTCALC = 750;
const presets = {
    custom: { name: "Custom", multiplier: 2.4, referencePeriod: 24, comparisonPeriod: 6 },
    ets1: { name: "ETS1 Article 29a", multiplier: 2.4, referencePeriod: 24, comparisonPeriod: 6 },
    ets2early: { name: "ETS2 2027–2028", multiplier: 1.5, referencePeriod: 6, comparisonPeriod: 3 },
    ets2small: { name: "ETS2 2029+ (50M permits)", multiplier: 2, referencePeriod: 6, comparisonPeriod: 3 },
    ets2large: { name: "ETS2 2029+ (150M permits)", multiplier: 3, referencePeriod: 6, comparisonPeriod: 3 },
    shrinkExample: { name: "Shrink Mode (m = 1 / 2.4)", multiplier: 0.4167, referencePeriod: 24, comparisonPeriod: 6 }
};

function Calculator() {
    const [activeField, setActiveField] = useState(null);
    const [highlightFields, setHighlightFields] = useState([]);
    const [preset, setPreset] = useState("ets1");
    const [values, setValues] = useState({
        "Multiplier (m)": "2.4",
        "Reference Period (months)": "24",
        "Recent Comparison Period (months)": "6",
        "Monthly factor": "1.0665", // stores r (if growth) or s (if shrink)
        "Annual price factor": "2.16"
    });

    const multiplierNum = Number(values["Multiplier (m)"]);
    const isShrinkMode = !isNaN(multiplierNum) && multiplierNum > 0 && multiplierNum < 1;

    // Helper text for fraction (e.g. 1 / 2.40)
    const fractionText = useMemo(() => {
        if (isShrinkMode && multiplierNum > 0) {
            const denom = (1 / multiplierNum).toFixed(2);
            return `(1 / ${denom})`;
        }
        return null;
    }, [isShrinkMode, multiplierNum]);

    function updateCalculatedFields(updates) {
        setValues(prev => ({ ...prev, ...updates }));

        const keysToHighlight = Object.keys(updates);
        if ("Monthly factor" in updates || "Annual price factor" in updates) {
            keysToHighlight.push(isShrinkMode ? "Annual shrink rate (%)" : "Annual growth rate (%)");
        }

        setHighlightFields(keysToHighlight);
        setTimeout(() => setHighlightFields([]), 1000);
    }

    function applyPreset(key) {
        const p = presets[key];
        setPreset(key);
        const m = p.multiplier;
        const isShrink = m < 1;

        setValues({
            "Multiplier (m)": String(m),
            "Reference Period (months)": String(p.referencePeriod),
            "Recent Comparison Period (months)": String(p.comparisonPeriod),
            "Monthly factor": isShrink ? "1.0665" : "1.0665"
        });

        setActiveField("Multiplier (m)");
    }

    useEffect(() => {
        if (!activeField) return;

        const timer = setTimeout(() => {
            const mVal = values["Multiplier (m)"];
            const rVal = values["Monthly factor"];
            const rpVal = values["Reference Period (months)"];
            const rcpVal = values["Recent Comparison Period (months)"];

            if (mVal === "" || rVal === "" || rpVal === "" || rcpVal === "") return;

            const multiplier = Number(mVal);
            const referencePeriod = Number(rpVal);
            const comparisonPeriod = Number(rcpVal);

            if (referencePeriod <= 0 || comparisonPeriod <= 0 || multiplier <= 0) return;

            const currentIsShrink = multiplier < 1;

            if (
                activeField === "Multiplier (m)" ||
                activeField === "Reference Period (months)" ||
                activeField === "Recent Comparison Period (months)"
            ) {
                const r = solveForGrowthFactor(multiplier, referencePeriod, comparisonPeriod);
                const factorToShow = currentIsShrink ? (1 / r) : r;
                const annualVal = currentIsShrink ? annualFactor(1 / r) : annualFactor(r);

                const nextFactorStr = factorToShow.toFixed(4);
                const nextAnnualStr = annualVal.toFixed(2);

                if (values["Monthly factor"] !== nextFactorStr || values["Annual price factor"] !== nextAnnualStr) {
                    updateCalculatedFields({
                        "Monthly factor": nextFactorStr,
                        "Annual price factor": nextAnnualStr
                    });
                }
            }

            if (activeField === "Monthly factor") {
                const factorInput = Number(values["Monthly factor"]);
                const r = currentIsShrink ? (1 / factorInput) : factorInput;

                const resultM = solveForMultiplier(r, referencePeriod, comparisonPeriod);
                const annualVal = currentIsShrink ? annualFactor(1 / r) : annualFactor(r);

                const nextMStr = resultM.toFixed(2);
                const nextAnnualStr = annualVal.toFixed(2);

                if (values["Multiplier (m)"] !== nextMStr || values["Annual price factor"] !== nextAnnualStr) {
                    updateCalculatedFields({
                        "Multiplier (m)": nextMStr,
                        "Annual price factor": nextAnnualStr
                    });
                }
            }

            if (activeField === "Annual price factor") {
                const annualVal = Number(values["Annual price factor"]);
                const monthlyFac = monthlyFactorFromAnnualFactor(annualVal);
                const r = currentIsShrink ? (1 / monthlyFac) : monthlyFac;

                const resultM = solveForMultiplier(r, referencePeriod, comparisonPeriod);
                const factorToShow = monthlyFac;

                const nextFactorStr = factorToShow.toFixed(4);
                const nextMStr = resultM.toFixed(2);

                if (values["Monthly factor"] !== nextFactorStr || values["Multiplier (m)"] !== nextMStr) {
                    updateCalculatedFields({
                        "Monthly factor": nextFactorStr,
                        "Multiplier (m)": nextMStr
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
        setValues(prev => ({ ...prev, [title]: value }));

        if (
            title === "Multiplier (m)" ||
            title === "Reference Period (months)" ||
            title === "Recent Comparison Period (months)"
        ) {
            setPreset("custom");
        }
    }

    // Calculations for displayed rate
    const displayedFactor = Number(values["Monthly factor"]);
    const effectiveR = isShrinkMode ? (1 / displayedFactor) : displayedFactor;

    const yearlyRate = useMemo(() => {
        if (isShrinkMode) {
            // Shrink rate % = (s^12 - 1) * 100%
            return ((annualFactor(displayedFactor) - 1) * 100).toFixed(2);
        } else {
            return (annualGrowthRate(effectiveR) * 100).toFixed(2);
        }
    }, [isShrinkMode, displayedFactor, effectiveR]);

    return (
        <div className={`calculator ${isShrinkMode ? "shrink-active" : ""}`}>
            <div className="preset">
                <label>Select EU ETS mechanism</label>
                <select value={preset} onChange={(e) => applyPreset(e.target.value)}>
                    {Object.entries(presets).map(([key, value]) => (
                        <option key={key} value={key}>
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
                    subText={fractionText}
                    isRed={isShrinkMode}
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

            <div className="calculator-body">
                <div className="growth-column">
                    <ParameterInput
                        title={isShrinkMode ? "Minimum monthly constant shrink factor (s)" : "Maximum monthly constant growth factor (r)"}
                        value={values["Monthly factor"]}
                        step="0.0001"
                        onChange={handleChange}
                        onFocus={handleFocus}
                        highlight={highlightFields.includes("Monthly factor")}
                        isRed={isShrinkMode}
                    />

                    <ParameterInput
                        title={isShrinkMode ? "Annual shrink factor" : "Annual price factor"}
                        value={values["Annual price factor"]}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        step="0.01"
                        highlight={highlightFields.includes("Annual price factor")}
                        isRed={isShrinkMode}
                    />

                    <ParameterInput
                        title={isShrinkMode ? "Annual shrink rate (%)" : "Annual growth rate (%)"}
                        value={yearlyRate}
                        decimals={2}
                        readOnly={true}
                        highlight={highlightFields.includes("Annual shrink rate (%)") || highlightFields.includes("Annual growth rate (%)")}
                        isRed={isShrinkMode}
                    />
                </div>

                <div className="graph-column">
                    <PriceGraph
                        growthFactor={effectiveR}
                        referencePeriod={Number(values["Reference Period (months)"])}
                        comparisonPeriod={Number(values["Recent Comparison Period (months)"])}
                        isShrinkMode={isShrinkMode}
                    />
                </div>
            </div>
        </div>
    );
}

export default Calculator;
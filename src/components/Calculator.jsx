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
        "Maximum monthly constant growth factor (r)": "1.0665",
        "Annual price factor": "2.16"
    });

    const multiplierNum = Number(values["Multiplier (m)"]);
    const isShrinkMode = !isNaN(multiplierNum) && multiplierNum > 0 && multiplierNum < 1;

    // Subtext for fraction (e.g. 1 / 2.40)
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
        if ("Maximum monthly constant growth factor (r)" in updates || "Annual price factor" in updates) {
            keysToHighlight.push(isShrinkMode ? "Annual shrink rate (%)" : "Annual growth rate (%)");
        }

        setHighlightFields(keysToHighlight);
        setTimeout(() => setHighlightFields([]), 1000);
    }

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
        if (!activeField) return;

        const timer = setTimeout(() => {
            if (
                values["Multiplier (m)"] === "" ||
                values["Reference Period (months)"] === "" ||
                values["Recent Comparison Period (months)"] === ""
            ) {
                return;
            }

            const multiplier = Number(values["Multiplier (m)"]);
            const referencePeriod = Number(values["Reference Period (months)"]);
            const comparisonPeriod = Number(values["Recent Comparison Period (months)"]);

            if (referencePeriod <= 0 || comparisonPeriod <= 0 || multiplier <= 0) return;

            if (
                activeField === "Multiplier (m)" ||
                activeField === "Reference Period (months)" ||
                activeField === "Recent Comparison Period (months)"
            ) {
                const r = solveForGrowthFactor(multiplier, referencePeriod, comparisonPeriod);
                const nextGrowth = r.toFixed(4);
                const nextAnnual = annualFactor(r).toFixed(2);

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

            if (activeField === "Annual price factor") {
                const annualVal = Number(values["Annual price factor"]);
                const r = monthlyFactorFromAnnualFactor(annualVal);
                const resultM = solveForMultiplier(r, referencePeriod, comparisonPeriod);

                const nextGrowth = r.toFixed(4);
                const nextMultiplier = resultM.toFixed(2);

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
        setValues(prev => ({ ...prev, [title]: value }));

        if (
            title === "Multiplier (m)" ||
            title === "Reference Period (months)" ||
            title === "Recent Comparison Period (months)"
        ) {
            setPreset("custom");
        }
    }

    const currentR = Number(values["Maximum monthly constant growth factor (r)"]);

    // Calculate annual rate (%):
    // Growth Mode: (r^12 - 1) * 100%
    // Shrink Mode: (1 - r^12) * 100% (Positive shrink percentage)
    const yearlyRate = useMemo(() => {
        if (isNaN(currentR) || currentR <= 0) return "0.00";
        const factor12 = annualFactor(currentR);
        if (isShrinkMode) {
            return ((1 - factor12) * 100).toFixed(2);
        } else {
            return (annualGrowthRate(currentR) * 100).toFixed(2);
        }
    }, [isShrinkMode, currentR]);

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
                        title={
                            isShrinkMode
                                ? "Minimum monthly constant growth factor (r)"
                                : "Maximum monthly constant growth factor (r)"
                        }
                        value={values["Maximum monthly constant growth factor (r)"]}
                        step="0.0001"
                        readOnly={true}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        highlight={highlightFields.includes("Maximum monthly constant growth factor (r)")}
                        isRed={isShrinkMode}
                    />

                    <ParameterInput
                        title="Annual price factor"
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
                        highlight={
                            highlightFields.includes("Annual shrink rate (%)") ||
                            highlightFields.includes("Annual growth rate (%)")
                        }
                        isRed={isShrinkMode}
                    />
                </div>

                <div className="graph-column">
                    <PriceGraph
                        growthFactor={currentR}
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
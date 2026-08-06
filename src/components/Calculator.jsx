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
        "Monthly constant growth factor (r)": "1.0665",
        "Annual price factor": "2.16",
        "Annual rate (%)": "116.00"
    });

    const multiplierNum = Number(values["Multiplier (m)"]);
    const isShrinkMode = !isNaN(multiplierNum) && multiplierNum > 0 && multiplierNum < 1;

    // Dynamic titles for labels
    const growthTitle = isShrinkMode
        ? "Minimum monthly constant growth factor (r)"
        : "Maximum monthly constant growth factor (r)";

    const rateTitle = isShrinkMode
        ? "Annual shrink rate (%)"
        : "Annual growth rate (%)";

    // Subtext fraction display e.g. (1 / 2.40)
    const fractionText = useMemo(() => {
        if (isShrinkMode && multiplierNum > 0) {
            const denom = (1 / multiplierNum).toFixed(2);
            return `(1 / ${denom})`;
        }
        return null;
    }, [isShrinkMode, multiplierNum]);

    function updateCalculatedFields(updates) {
        setValues((prev) => ({ ...prev, ...updates }));

        const keysToHighlight = Object.keys(updates);
        if (keysToHighlight.includes("Monthly constant growth factor (r)")) {
            keysToHighlight.push(growthTitle);
        }
        if (keysToHighlight.includes("Annual rate (%)")) {
            keysToHighlight.push(rateTitle);
        }

        setHighlightFields(keysToHighlight);
        setTimeout(() => {
            setHighlightFields([]);
        }, 1000);
    }

    function applyPreset(key) {
        const p = presets[key];
        setPreset(key);
        const m = p.multiplier;
        const isShrink = m < 1;

        const r = solveForGrowthFactor(m, p.referencePeriod, p.comparisonPeriod);
        const annFac = annualFactor(r);
        const rate = isShrink ? (1 - annFac) * 100 : (annFac - 1) * 100;

        setValues({
            "Multiplier (m)": String(m),
            "Reference Period (months)": String(p.referencePeriod),
            "Recent Comparison Period (months)": String(p.comparisonPeriod),
            "Monthly constant growth factor (r)": r.toFixed(4),
            "Annual price factor": annFac.toFixed(2),
            "Annual rate (%)": rate.toFixed(2)
        });

        setActiveField(null);
    }

    useEffect(() => {
        if (!activeField) return;

        const timer = setTimeout(() => {
            const mVal = values["Multiplier (m)"];
            const rVal = values["Monthly constant growth factor (r)"];
            const rpVal = values["Reference Period (months)"];
            const rcpVal = values["Recent Comparison Period (months)"];
            const annVal = values["Annual price factor"];
            const rateVal = values["Annual rate (%)"];

            const referencePeriod = Number(rpVal);
            const comparisonPeriod = Number(rcpVal);

            if (referencePeriod <= 0 || comparisonPeriod <= 0) return;

            // 1. User edited Multiplier or Periods
            if (
                activeField === "Multiplier (m)" ||
                activeField === "Reference Period (months)" ||
                activeField === "Recent Comparison Period (months)"
            ) {
                const multiplier = Number(mVal);
                if (multiplier <= 0 || isNaN(multiplier)) return;

                const r = solveForGrowthFactor(multiplier, referencePeriod, comparisonPeriod);
                const annFac = annualFactor(r);
                const isShrink = multiplier < 1;
                const rate = isShrink ? (1 - annFac) * 100 : (annFac - 1) * 100;

                const nextR = r.toFixed(4);
                const nextAnn = annFac.toFixed(2);
                const nextRate = rate.toFixed(2);

                if (
                    values["Monthly constant growth factor (r)"] !== nextR ||
                    values["Annual price factor"] !== nextAnn ||
                    values["Annual rate (%)"] !== nextRate
                ) {
                    updateCalculatedFields({
                        "Monthly constant growth factor (r)": nextR,
                        "Annual price factor": nextAnn,
                        "Annual rate (%)": nextRate
                    });
                }
            }

            // 2. User edited Monthly Growth Factor (r)
            if (
                activeField === growthTitle ||
                activeField === "Monthly constant growth factor (r)"
            ) {
                const r = Number(rVal);
                if (r <= 0 || isNaN(r)) return;

                const resultM = solveForMultiplier(r, referencePeriod, comparisonPeriod);
                const annFac = annualFactor(r);
                const isShrink = resultM < 1;
                const rate = isShrink ? (1 - annFac) * 100 : (annFac - 1) * 100;

                const nextM = resultM.toFixed(2);
                const nextAnn = annFac.toFixed(2);
                const nextRate = rate.toFixed(2);

                if (
                    values["Multiplier (m)"] !== nextM ||
                    values["Annual price factor"] !== nextAnn ||
                    values["Annual rate (%)"] !== nextRate
                ) {
                    updateCalculatedFields({
                        "Multiplier (m)": nextM,
                        "Annual price factor": nextAnn,
                        "Annual rate (%)": nextRate
                    });
                }
            }

            // 3. User edited Annual Price Factor
            if (activeField === "Annual price factor") {
                const annFac = Number(annVal);
                if (annFac <= 0 || isNaN(annFac)) return;

                const r = monthlyFactorFromAnnualFactor(annFac);
                const resultM = solveForMultiplier(r, referencePeriod, comparisonPeriod);
                const isShrink = resultM < 1;
                const rate = isShrink ? (1 - annFac) * 100 : (annFac - 1) * 100;

                const nextM = resultM.toFixed(2);
                const nextR = r.toFixed(4);
                const nextRate = rate.toFixed(2);

                if (
                    values["Multiplier (m)"] !== nextM ||
                    values["Monthly constant growth factor (r)"] !== nextR ||
                    values["Annual rate (%)"] !== nextRate
                ) {
                    updateCalculatedFields({
                        "Multiplier (m)": nextM,
                        "Monthly constant growth factor (r)": nextR,
                        "Annual rate (%)": nextRate
                    });
                }
            }

            // 4. User edited Annual Rate (%)
            if (
                activeField === rateTitle ||
                activeField === "Annual rate (%)" ||
                activeField === "Annual growth rate (%)" ||
                activeField === "Annual shrink rate (%)"
            ) {
                const rate = Number(rateVal);
                if (isNaN(rate)) return;

                let annFac;
                if (isShrinkMode) {
                    annFac = 1 - rate / 100;
                } else {
                    annFac = 1 + rate / 100;
                }

                if (annFac <= 0) return;

                const r = monthlyFactorFromAnnualFactor(annFac);
                const resultM = solveForMultiplier(r, referencePeriod, comparisonPeriod);

                const nextM = resultM.toFixed(2);
                const nextR = r.toFixed(4);
                const nextAnn = annFac.toFixed(2);

                if (
                    values["Multiplier (m)"] !== nextM ||
                    values["Monthly constant growth factor (r)"] !== nextR ||
                    values["Annual price factor"] !== nextAnn
                ) {
                    updateCalculatedFields({
                        "Multiplier (m)": nextM,
                        "Monthly constant growth factor (r)": nextR,
                        "Annual price factor": nextAnn
                    });
                }
            }
        }, TIMEOUTCALC);

        return () => clearTimeout(timer);
    }, [values, activeField, growthTitle, rateTitle, isShrinkMode]);

    function handleFocus(title) {
        setActiveField(title);
    }

    function handleChange(title, value) {
        let stateKey = title;
        if (title === growthTitle) {
            stateKey = "Monthly constant growth factor (r)";
        } else if (title === rateTitle) {
            stateKey = "Annual rate (%)";
        }

        setValues((prev) => ({ ...prev, [stateKey]: value }));

        if (
            stateKey === "Multiplier (m)" ||
            stateKey === "Reference Period (months)" ||
            stateKey === "Recent Comparison Period (months)" ||
            stateKey === "Monthly constant growth factor (r)" ||
            stateKey === "Annual rate (%)" ||
            stateKey === "Annual price factor"
        ) {
            setPreset("custom");
        }
    }

    const currentR = Number(values["Monthly constant growth factor (r)"]);

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
                    step={0.01}
                    highlight={highlightFields.includes("Multiplier (m)")}
                    subText={fractionText}
                    isRed={isShrinkMode}
                />

                <ParameterInput
                    title="Reference Period (months)"
                    value={values["Reference Period (months)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step={1}
                    highlight={highlightFields.includes("Reference Period (months)")}
                />

                <ParameterInput
                    title="Recent Comparison Period (months)"
                    value={values["Recent Comparison Period (months)"]}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    step={1}
                    highlight={highlightFields.includes("Recent Comparison Period (months)")}
                />
            </div>

            <div className="calculator-body">
                <div className="growth-column">
                    <ParameterInput
                        title={growthTitle}
                        value={values["Monthly constant growth factor (r)"]}
                        step={0.001}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        highlight={
                            highlightFields.includes("Monthly constant growth factor (r)") ||
                            highlightFields.includes(growthTitle)
                        }
                        isRed={isShrinkMode}
                    />

                    <ParameterInput
                        title="Annual price factor"
                        value={values["Annual price factor"]}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        step={0.01}
                        highlight={highlightFields.includes("Annual price factor")}
                        isRed={isShrinkMode}
                    />

                    <ParameterInput
                        title={rateTitle}
                        value={values["Annual rate (%)"]}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        step={1}
                        highlight={
                            highlightFields.includes("Annual rate (%)") ||
                            highlightFields.includes(rateTitle)
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
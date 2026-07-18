import React, {useState, useEffect} from "react";

const HIGHLIGHTTIME = 1000;

function ParameterInput({
                            title,
                            value,
                            onChange,
                            onFocus,
                            decimals = null,
                            // readOnly = false,
                            step = "1",
                            highlightChanges = true
                        }) {

    const [values, setValues] = useState({
        "Multiplier (m)": "2.4",
        "Reference Period (months)": "24",
        "Recent Comparison Period (months)": "6",
        "Maximum monthly constant growth factor (r)": "1.0665"
    });


    const [activeField, setActiveField] = useState(null);
    const [inputValue, setInputValue] = useState(String(value ?? ""));
    const [highlight, setHighlight] = useState(false);

    const [isFocused, setIsFocused] = useState(false);


    useEffect(() => {

        if (!activeField) {
            return;
        }


        const timer = setTimeout(() => {
            const multiplier =
                Number(values["Multiplier (m)"]);
            const referencePeriod =
                Number(values["Reference Period (months)"]);
            const comparisonPeriod =
                Number(values["Recent Comparison Period (months)"]);

            if (activeField === "Multiplier (m)") {

                const result =
                    solveForGrowthFactor(
                        multiplier,
                        referencePeriod,
                        comparisonPeriod
                    );

                setValues(prev => ({
                    ...prev,
                    "Maximum monthly constant growth factor (r)":
                        result.toFixed(4)
                }));
            }
            if (
                activeField ===
                "Maximum monthly constant growth factor (r)"
            ) {
                const result =
                    solveForMultiplier(
                        Number(
                            values[
                                "Maximum monthly constant growth factor (r)"
                                ]
                        ),
                        referencePeriod,
                        comparisonPeriod
                    );

                setValues(prev => ({
                    ...prev,
                    "Multiplier (m)":
                        result.toFixed(2)
                }));
            }
        }, 750);

        return () => clearTimeout(timer);


    }, [values, activeField]);


    function handleChange(title, value) {

        setValues(prev => ({
            ...prev,
            [title]: value
        }));

    }

    function handleFocus(title) {
        setActiveField(title);
    }

    function handleBlur(e) {
        const text = e.target.value;
        if (decimals !== null && text !== "") {
            const formatted = Number(text).toFixed(decimals);
            setInputValue(formatted);
            onChange(formatted);
        }
    }


    return (

        <div className="parameter">

            <label>
                {title}
            </label>

            <input
                className={highlight ? "updated" : ""}
                type="number"
                value={inputValue}
                readOnly={readOnly}
                onChange={handleChange}
                // onFocus={() => setIsFocused(true)}
                onFocus={() => setActiveField(title)}
                // onBlur={handleBlur}
                onBlur={(e) => {
                    setActiveField(null);
                    handleBlur(e);
                }}
                step={step}
            />
        </div>

    );

}


export default ParameterInput;
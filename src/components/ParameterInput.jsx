import React from "react";
import NumberPicker from "react-widgets/NumberPicker";
import "react-widgets/styles.css";

function ParameterInput({
    title,
    value,
    onChange,
    onFocus,
    readOnly = false,
    step = "1",
    highlight = false,
    decimals = 4
}) {
    // Safely parse numeric value for NumberPicker
    const numericValue =
        value === "" || value === null || value === undefined || isNaN(Number(value))
            ? null
            : Number(value);

    const numericStep = Number(step) || 1;

    return (
        <div className="parameter">
            <label>{title}</label>
            <NumberPicker
                className={highlight ? "updated" : ""}
                value={numericValue}
                readOnly={readOnly}
                disabled={readOnly}
                step={numericStep}
                onFocus={() => onFocus && onFocus(title)}
                onChange={(val) => {
                    if (!readOnly && onChange) {
                        onChange(
                            title,
                            val !== null && val !== undefined ? String(val) : ""
                        );
                    }
                }}
            />
        </div>
    );
}

export default ParameterInput;
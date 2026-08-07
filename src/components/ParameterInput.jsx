import React from "react";
import NumberPicker from "react-widgets/NumberPicker";

function ParameterInput({
    title,
    value,
    onChange,
    onFocus,
    readOnly = false,
    step = 1,
      min = undefined, // Pass min prop (e.g. min={0})
    highlight = false,
    isRed = false,
    subText = null
}) {
    const numericStep = typeof step === "string" ? parseFloat(step) : step;

    // Convert string value to number or null for NumberPicker
    const numericValue =
        value === "" || value === null || value === undefined || isNaN(Number(value))
            ? null
            : Number(value);

    return (
        <div className={`parameter ${isRed ? "parameter-red" : ""}`}>
            <label className={isRed ? "label-red" : ""}>{title}</label>

            <div className="input-wrapper">
                <NumberPicker
                    className={`${highlight ? "updated" : ""} ${isRed ? "input-red" : ""}`}
                    value={numericValue}
                    readOnly={readOnly}
                    step={numericStep}
                     min={min} // Restricts spin buttons in react-widgets
                    onFocus={() => onFocus && onFocus(title)}
                    onChange={(val) => {
                        if (val === null || val === undefined || isNaN(val)) {
                            onChange(title, "");
                        } else {
                              // Enforce min constraint on manual input
                            let finalVal = val;
                            if (min !== undefined && finalVal < min) {
                                finalVal = min;
                            }
                            onChange(title, String(finalVal));
                        }
                    }}
                />
                {subText && <span className="input-subtext">{subText}</span>}
            </div>
        </div>
    );
}

export default ParameterInput;
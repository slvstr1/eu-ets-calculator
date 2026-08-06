import React from "react";
import NumberPicker from "react-widgets/NumberPicker";

function ParameterInput({
    title,
    value,
    onChange,
    onFocus,
    readOnly = false,
    step = 1,
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
                    onFocus={() => onFocus && onFocus(title)}
                    onChange={(val) => {
                        if (val === null || val === undefined || isNaN(val)) {
                            onChange(title, "");
                        } else {
                            onChange(title, String(val));
                        }
                    }}
                />
                {subText && <span className="input-subtext">{subText}</span>}
            </div>
        </div>
    );
}

export default ParameterInput;
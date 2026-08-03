import React from "react";

function ParameterInput({
    title,
    value,
    onChange,
    onFocus,
    readOnly = false,
    step = "1",
    highlight = false,
    isRed = false,
    subText = null
}) {
    return (
        <div className={`parameter ${isRed ? "parameter-red" : ""}`}>
            <label className={isRed ? "label-red" : ""}>
                {title}
            </label>

            <div className="input-wrapper">
                <input
                    className={`${highlight ? "updated" : ""} ${isRed ? "input-red" : ""}`}
                    type="number"
                    value={value ?? ""}
                    readOnly={readOnly}
                    onFocus={() => onFocus(title)}
                    onChange={(e) => onChange(title, e.target.value)}
                    step={step}
                />
                {subText && <span className="input-subtext">{subText}</span>}
            </div>
        </div>
    );
}

export default ParameterInput;
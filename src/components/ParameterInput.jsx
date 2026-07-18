import React from "react";

function ParameterInput({
    title,
    value,
    onChange,
    onFocus,
    readOnly = false,
    step = "1",
    highlight = false
}) {

    return (
        <div className="parameter">

            <label>
                {title}
            </label>

            <input
                className={highlight ? "updated" : ""}
                type="number"
                value={value ?? ""}
                readOnly={readOnly}
                onFocus={() => onFocus(title)}
                onChange={(e) =>
                    onChange(title, e.target.value)
                }
                step={step}
            />

        </div>
    );
}

export default ParameterInput;
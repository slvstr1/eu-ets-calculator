import React, {useState, useEffect, useRef} from "react";

function ParameterInput({
                            title,
                            value,
                            onChange,
                            onFocus,
                            readOnly = false,
                            step = "1",
                            // highlight = false,
                            decimals = 4
                        }) {
    const [highlight, setHighlight] = useState(false);
    const [inputValue, setInputValue] = useState(String(value ?? ""));
    const previousValue = useRef(String(value ?? ""));

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
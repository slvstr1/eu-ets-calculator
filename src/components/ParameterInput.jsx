import React, {useState, useEffect} from "react";

const HIGHLIGHTTIME = 1000;

function ParameterInput({
                            title,
                            value,
                            onChange,
                            decimals = null,
                            readOnly = false,
                            step = "1",
                            highlightChanges = true
                        }) {
    // const [animationKey, setAnimationKey] = useState(0);
    const [inputValue, setInputValue] = useState(String(value ?? ""));
    const [highlight, setHighlight] = useState(false);

    const [isFocused, setIsFocused] = useState(false);

    // useEffect(() => {
    //
    //     const newValue =
    //         decimals === null
    //             ? String(value ?? "")
    //             : Number(value).toFixed(decimals);
    //
    //     if (newValue !== inputValue) {
    //
    //         setInputValue(newValue);
    //
    //         if (highlightChanges) {
    //
    //             setHighlight(true);
    //
    //             const timer = setTimeout(() => {
    //                 setHighlight(false);
    //             }, HIGHLIGHTTIME);
    //
    //             return () => clearTimeout(timer);
    //         }
    //     }
    //
    // }, [value]);
    useEffect(() => {

        const newValue =
            decimals === null
                ? String(value ?? "")
                : Number(value).toFixed(decimals);

        setInputValue(newValue);

        if (!isFocused && highlightChanges) {

            setHighlight(true);

            const timer = setTimeout(() => {
                setHighlight(false);
            }, HIGHLIGHTTIME);

            return () => clearTimeout(timer);
        }

    }, [value]);

    function handleChange(e) {

        const text = e.target.value;

        setInputValue(text);

        onChange(text);

    }


    function handleBlur() {

        if (decimals !== null && inputValue !== "") {

            const formatted =
                Number(inputValue).toFixed(decimals);

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
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                step={step}
            />
        </div>

    );

}


export default ParameterInput;
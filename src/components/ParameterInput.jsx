import React, { useState, useEffect } from "react";


function ParameterInput({
    title,
    value,
    onChange,
    decimals = null,
    readOnly = false,
    step = "1"
}) {

    const [inputValue, setInputValue] = useState(String(value ?? ""));
    const [highlight, setHighlight] = useState(false);


    /*
        Update displayed value when calculation changes it
    */
    useEffect(() => {

        const newValue =
            decimals === null
                ? String(value ?? "")
                : Number(value).toFixed(decimals);


        if (newValue !== inputValue) {

            setInputValue(newValue);

            setHighlight(true);

            const timer = setTimeout(() => {
                setHighlight(false);
            }, 500);

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
                onBlur={handleBlur}
                step={step}
            />

        </div>

    );

}


export default ParameterInput;
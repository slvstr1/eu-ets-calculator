import React, { useState, useEffect } from "react";


function ParameterInput({
    title,
    value,
    onChange,
    decimals = null,
    readOnly = false,
    step = "0.0001"
}) {

    const [inputValue, setInputValue] = useState(value);


    /*
        Update displayed value when calculation changes it
    */
    useEffect(() => {

        if (document.activeElement?.value !== inputValue) {

            setInputValue(
                decimals === null
                    ? value
                    : Number(value).toFixed(decimals)
            );

        }

    }, [value]);



    function handleChange(e) {

        setInputValue(e.target.value);

        onChange(e.target.value);

    }



    function handleBlur() {

        if (decimals !== null && inputValue !== "") {

            setInputValue(
                Number(inputValue).toFixed(decimals)
            );

        }

    }



    return (

        <div className="parameter">

            <label>
                {title}
            </label>


            <input
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
import React, {useState, useEffect} from "react";

const HIGHLIGHTTIME = 1000;

function ParameterInput({
                            title,
                            value,
                            onChange,
                            decimals = null,
                            readOnly = false,
                            step = "1"
                        }) {
    const [animationKey, setAnimationKey] = useState(0);
    const [inputValue, setInputValue] = useState(String(value ?? ""));
    const [highlight, setHighlight] = useState(false);


    /*
        Update displayed value when calculation changes it
    */
    // useEffect(() => {
    //
    //     const newValue =
    //         decimals === null
    //             ? String(value ?? "")
    //             : Number(value).toFixed(decimals);
    //
    //
    //     if (newValue !== inputValue) {
    //
    //         setInputValue(newValue);
    //
    //         setHighlight(true);
    //
    //         const timer = setTimeout(() => {
    //             setHighlight(false);
    //         }, HIGHLIGHTTIME);
    //
    //         return () => clearTimeout(timer);
    //     }
    //
    // }, [value]);
    useEffect(() => {

        const newValue =
            decimals === null
                ? String(value ?? "")
                : Number(value).toFixed(decimals);


        if (newValue !== inputValue) {

            setInputValue(newValue);

            setAnimationKey(k => k + 1);

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


            {/*<input*/}
            {/*    className={highlight ? "updated" : ""}*/}
            {/*    type="number"*/}
            {/*    value={inputValue}*/}
            {/*    readOnly={readOnly}*/}
            {/*    onChange={handleChange}*/}
            {/*    onBlur={handleBlur}*/}
            {/*    step={step}*/}
            {/*/>*/}
            <input
                key={animationKey}
                className="updated"
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
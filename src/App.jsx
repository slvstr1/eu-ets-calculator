import React from "react";
import Header from "./components/Header.jsx";
import Calculator from "./components/Calculator.jsx";

function App() {
    return (
        <div className="page">
            <div className="container">
                <Header/>
                <Calculator/>
            </div>
        </div>
    );
}

export default App;
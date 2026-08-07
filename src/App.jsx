import React from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Calculator from "./components/Calculator.jsx";

function App() {
    return (
        <div className="page">
            <div className="container">
                <Header/>
                <Calculator/>
                <Footer/>
            </div>
        </div>
    );
}

export default App;
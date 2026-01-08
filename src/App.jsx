import {useState} from "react";
import HomePage from "./views/HomePage.jsx";
import CartPage from "./views/CartPage.jsx";

const App = () => {
    const [currentPage, setCurrentPage] = useState('home');

    return (
        <div className="min-h-screen bg-white">
            {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
            {currentPage === 'cart' && <CartPage onNavigate={setCurrentPage} />}
        </div>
    );
};

export default App;
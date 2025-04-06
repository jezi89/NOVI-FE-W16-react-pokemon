import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useEffect} from "react";
import PokemonGrid from "./PokemonGrid.jsx";
import PokemonDetail from "./PokemonDetail.jsx";
import './index.css'; // Import global styles
import './cursor.css'; // Import cursor styles

// Layout component voor gemeenschappelijke structuur
function Layout({children}) {
    useEffect(() => {
        // Voeg de cursor klasse toe aan het body element wanneer de component laadt
        document.body.classList.add('pokeball-cursor');
        
        // Cleanup bij unmount
        return () => {
            document.body.classList.remove('pokeball-cursor');
        };
    }, []);

    return (
        <div className="app-container">
            {children}
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<PokemonGrid/>}/>
                    <Route path="/pokemon/:name" element={<PokemonDetail/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;

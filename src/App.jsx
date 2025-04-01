import {BrowserRouter, Routes, Route} from "react-router-dom";
import PokemonGrid from "./PokemonGrid.jsx";
import PokemonDetail from "./PokemonDetail.jsx";
import './index.css'; // Import global styles

// Layout component voor gemeenschappelijke structuur
function Layout({children}) {
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

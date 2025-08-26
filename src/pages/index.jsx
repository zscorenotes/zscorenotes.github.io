// src/pages/index.jsx

import Layout from "./Layout.jsx";
import Home from "./Home";
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// ... (keep the PAGES and _getCurrentPage function as is)

function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<Home />} />
                <Route path="/Home" element={<Home />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    // Replace 'your-repo-name' with your actual repository name
    const repoName = 'zscorenotes.github.io';

    return (
        <Router basename={`/${repoName}/`}>
            <PagesContent />
        </Router>
    );
}

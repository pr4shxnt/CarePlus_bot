import React, { useState, useEffect } from "react";
import { Home } from "./pages/Home";
import { Registration } from "./pages/Registration";
import { Download } from "./pages/Download";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    // Link click interception
    const handleLinkClick = (e) => {
      const target = e.target.closest("a");
      if (target && target.hasAttribute("data-link")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        window.history.pushState(null, null, href);
        setCurrentPath(href);
      }
    };

    document.addEventListener("click", handleLinkClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState(null, null, path);
    setCurrentPath(path);
  };

  // Render active page
  const renderPage = () => {
    switch (currentPath) {
      case "/":
        return <Home />;
      case "/registration":
        return <Registration />;
      case "/download":
        return <Download />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="content">
      <nav className="navbar">
        <div className="logo">
          <a href="/" data-link>
            CarePlus<span className="dot">.</span>
          </a>
        </div>
        <ul className="nav-links">
          <li>
            <a href="/" data-link className={currentPath === "/" ? "active" : ""}>
              Home
            </a>
          </li>
          <li>
            <a href="/registration" data-link className={currentPath === "/registration" ? "active" : ""}>
              Register
            </a>
          </li>
          <li>
            <a href="/download" data-link className={currentPath === "/download" ? "active" : ""}>
              Download
            </a>
          </li>
        </ul>
        <button 
          className="nav-btn" 
          id="signin-btn" 
          onClick={() => window.location.href = "https://admin-care-plus.vercel.app"}
        >
          Sign In
        </button>
      </nav>

      <div id="router-view">
        {renderPage()}
      </div>

      <footer className="footer">
        <p>
          &copy; 2026 CarePlus Innovation. All Rights Reserved. Not a substitute for emergency medical services.
        </p>
      </footer>
    </div>
  );
}

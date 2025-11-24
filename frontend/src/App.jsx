import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import NewOrder from './components/NewOrder'
import Ledger from './components/Ledger'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🍕 PizzaPoint
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/order" className="nav-link">New Order</Link>
              </li>
              <li className="nav-item">
                <Link to="/ledger" className="nav-link">Ledger</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order" element={<NewOrder />} />
          <Route path="/ledger" element={<Ledger />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

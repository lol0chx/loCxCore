import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">🍕 Welcome to PizzaPoint 🍕</h1>
        <p className="hero-subtitle">Your Favorite Pizza Destination!</p>
        
        <div className="action-cards">
          <Link to="/order" className="action-card">
            <div className="card-icon">🛒</div>
            <h2>New Order</h2>
            <p>Create a fresh pizza order with your favorite toppings</p>
          </Link>
          
          <Link to="/ledger" className="action-card">
            <div className="card-icon">📊</div>
            <h2>View Ledger</h2>
            <p>Check all your previous orders and receipts</p>
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span>Custom Pizzas</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Fast Service</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✨</span>
            <span>Fresh Ingredients</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

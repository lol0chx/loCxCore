import React, { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import './NewOrder.css'

function NewOrder() {
  const [customerName, setCustomerName] = useState('')
  const [currentItem, setCurrentItem] = useState({
    type: 'pizza',
    size: 'MEDIUM',
    crust: 'REGULAR',
    sauce: 'MARINARA',
    cheese: 'MOZZARELLA',
    toppings: []
  })
  const [cart, setCart] = useState([])
  const [message, setMessage] = useState('')

  const toppingOptions = [
    'Pepperoni', 'Mushrooms', 'Onions', 'Italian Sausage', 'Bacon',
    'Olives', 'Bell Peppers', 'Pineapple', 'Spinach', 'Tomatoes',
    'Ham', 'Chicken', 'Beef', 'Garlic', 'Basil', 'Jalapeños'
  ]

  const addToCart = () => {
    setCart([...cart, { ...currentItem, id: Date.now() }])
    setMessage('✅ Item added to cart!')
    setTimeout(() => setMessage(''), 3000)
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const toggleTopping = (topping) => {
    setCurrentItem(prev => ({
      ...prev,
      toppings: prev.toppings.includes(topping)
        ? prev.toppings.filter(t => t !== topping)
        : [...prev.toppings, topping]
    }))
  }

  const calculateTotal = () => {
    let total = 0
    cart.forEach(item => {
      if (item.type === 'pizza') {
        const sizePrice = { SMALL: 8, MEDIUM: 12, LARGE: 16 }
        total += sizePrice[item.size] || 12
        total += item.toppings.length * 1.5
      }
    })
    return total.toFixed(2)
  }

  const submitOrder = async () => {
    if (!customerName.trim()) {
      setMessage('❌ Please enter your name!')
      return
    }
    
    if (cart.length === 0) {
      setMessage('❌ Your cart is empty!')
      return
    }

    try {
      const orderData = {
        customerName: customerName,
        items: cart,
        totalPrice: calculateTotal(),
        orderDate: new Date().toISOString()
      }

      await orderAPI.createOrder(orderData)
      setMessage('🎉 Order placed successfully!')
      setCart([])
      setCustomerName('')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Error placing order. Please try again.')
      console.error('Order error:', error)
    }
  }

  return (
    <div className="order-container">
      <div className="container">
        <h1 className="page-title">🛒 Create New Order</h1>
        
        {message && <div className="message">{message}</div>}

        <div className="order-grid">
          <div className="order-section">
            <div className="card">
              <h2>Customer Information</h2>
              <input
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="customer-input"
              />
            </div>

            <div className="card">
              <h2>Build Your Pizza</h2>
              
              <div className="form-group">
                <label>Size</label>
                <select
                  value={currentItem.size}
                  onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value })}
                >
                  <option value="SMALL">Small - $8.00</option>
                  <option value="MEDIUM">Medium - $12.00</option>
                  <option value="LARGE">Large - $16.00</option>
                </select>
              </div>

              <div className="form-group">
                <label>Crust</label>
                <select
                  value={currentItem.crust}
                  onChange={(e) => setCurrentItem({ ...currentItem, crust: e.target.value })}
                >
                  <option value="REGULAR">Regular</option>
                  <option value="THIN">Thin Crust</option>
                  <option value="THICK">Thick Crust</option>
                  <option value="STUFFED">Stuffed Crust</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sauce</label>
                <select
                  value={currentItem.sauce}
                  onChange={(e) => setCurrentItem({ ...currentItem, sauce: e.target.value })}
                >
                  <option value="MARINARA">Marinara</option>
                  <option value="BBQ">BBQ</option>
                  <option value="WHITE_GARLIC">White Garlic</option>
                  <option value="PESTO">Pesto</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cheese</label>
                <select
                  value={currentItem.cheese}
                  onChange={(e) => setCurrentItem({ ...currentItem, cheese: e.target.value })}
                >
                  <option value="MOZZARELLA">Mozzarella</option>
                  <option value="CHEDDAR">Cheddar</option>
                  <option value="PARMESAN">Parmesan</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Toppings ($1.50 each)</label>
                <div className="toppings-grid">
                  {toppingOptions.map(topping => (
                    <button
                      key={topping}
                      className={`topping-btn ${currentItem.toppings.includes(topping) ? 'active' : ''}`}
                      onClick={() => toggleTopping(topping)}
                    >
                      {topping}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={addToCart} className="btn-primary full-width">
                Add to Cart
              </button>
            </div>
          </div>

          <div className="cart-section">
            <div className="card">
              <h2>Your Cart ({cart.length})</h2>
              
              {cart.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item, index) => (
                      <div key={item.id} className="cart-item">
                        <div className="item-details">
                          <h3>Pizza #{index + 1}</h3>
                          <p>{item.size} - {item.crust}</p>
                          <p>{item.sauce} - {item.cheese}</p>
                          {item.toppings.length > 0 && (
                            <p className="toppings">Toppings: {item.toppings.join(', ')}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="btn-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="cart-total">
                    <h3>Total: ${calculateTotal()}</h3>
                  </div>

                  <button onClick={submitOrder} className="btn-secondary full-width">
                    Place Order 🎉
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewOrder

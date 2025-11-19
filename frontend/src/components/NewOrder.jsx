import React, { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import './NewOrder.css'

function NewOrder() {
  const [customerName, setCustomerName] = useState('')
  const [currentItem, setCurrentItem] = useState({
    type: 'pizza',
    size: '',
    crust: '',
    sauce: '',
    cheese: '',
    toppings: {} // Changed to object to track quantities: { 'Pepperoni': 2, 'Mushrooms': 1 }
  })
  const [cart, setCart] = useState([])
  const [message, setMessage] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [cashAmount, setCashAmount] = useState('')

  const toppingOptions = [
    'Pepperoni', 'Mushrooms', 'Onions', 'Italian Sausage', 'Bacon',
    'Olives', 'Bell Peppers', 'Pineapple', 'Spinach', 'Tomatoes',
    'Ham', 'Chicken', 'Beef', 'Garlic', 'Basil', 'Jalapeños'
  ]

  // Topping prices - matches backend ToppingMenu.java exactly
  const toppingPrices = {
    'Pepperoni': 1.50,
    'Beef': 2.00,
    'Italian Sausage': 1.75,
    'Ham': 1.50,
    'Bacon': 2.00,
    'Chicken': 2.25,
    'Salami': 1.75,
    'Anchovies': 2.50,
    'Extra Cheese': 2.00,
    'Extra Sauce': 1.00,
    'Mushrooms': 1.00,
    'Bell Peppers': 0.75,
    'Onions': 0.50,
    'Olives': 1.00,
    'Tomatoes': 0.75,
    'Spinach': 1.00,
    'Jalapeños': 0.75,
    'Pineapple': 1.00,
    'Basil': 0.75,
    'Garlic': 0.50,
    'Artichokes': 1.50,
    'Sun-dried Tomatoes': 1.25
  }

  const addToCart = () => {
    // Validate all required fields are selected
    if (!currentItem.size || !currentItem.crust || !currentItem.sauce || !currentItem.cheese) {
      setMessage('❌ Please select Size, Crust, Sauce, and Cheese!')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setCart([...cart, { ...currentItem, id: Date.now() }])
    setMessage('✅ Item added to cart!')
    setTimeout(() => setMessage(''), 3000)
    
    // Reset to empty selections for next pizza
    setCurrentItem({
      type: 'pizza',
      size: '',
      crust: '',
      sauce: '',
      cheese: '',
      toppings: {}
    })
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const addTopping = (topping) => {
    setCurrentItem(prev => ({
      ...prev,
      toppings: {
        ...prev.toppings,
        [topping]: (prev.toppings[topping] || 0) + 1
      }
    }))
  }

  const removeTopping = (topping) => {
    setCurrentItem(prev => {
      const newToppings = { ...prev.toppings }
      if (newToppings[topping] > 1) {
        newToppings[topping]--
      } else {
        delete newToppings[topping]
      }
      return { ...prev, toppings: newToppings }
    })
  }

  const getToppingCount = (topping) => {
    return currentItem.toppings[topping] || 0
  }

  const getToppingPriceForSize = (topping, size) => {
    const basePrice = toppingPrices[topping] || 1.0
    const multiplier = size === 'SMALL' ? 1.0 : size === 'MEDIUM' ? 1.5 : 2.0
    return (basePrice * multiplier).toFixed(2)
  }

  const calculatePizzaPrice = (item) => {
    let price = 0
    
    // Base price for size
    const sizePrice = { SMALL: 10.99, MEDIUM: 14.99, LARGE: 18.99 }
    price += sizePrice[item.size] || 14.99
    
    // Crust extra cost with size multiplier
    const sizeMultiplier = item.size === 'SMALL' ? 1.0 : item.size === 'MEDIUM' ? 1.5 : 2.0
    const crustCost = item.crust === 'STUFFED' ? 2.0 * sizeMultiplier : 0.0
    price += crustCost
    
    // Toppings with exact prices, size multiplier, and quantities
    Object.entries(item.toppings).forEach(([topping, count]) => {
      const toppingPrice = toppingPrices[topping] || 1.0
      price += (toppingPrice * sizeMultiplier * count)
    })
    
    return price.toFixed(2)
  }

  const calculateTotal = () => {
    let total = 0
    cart.forEach(item => {
      if (item.type === 'pizza') {
        // Base price for size (matches backend PizzaSize.java)
        const sizePrice = { SMALL: 10.99, MEDIUM: 14.99, LARGE: 18.99 }
        total += sizePrice[item.size] || 14.99
        
        // Crust extra cost with size multiplier (stuffed crust scales with size)
        const toppingMultiplier = item.size === 'SMALL' ? 1.0 : item.size === 'MEDIUM' ? 1.5 : 2.0
        const crustCost = item.crust === 'STUFFED' ? 2.0 * toppingMultiplier : 0.0
        total += crustCost
        
        // Toppings with EXACT prices, size multiplier, and quantities
        Object.entries(item.toppings).forEach(([topping, count]) => {
          const toppingPrice = toppingPrices[topping] || 1.0
          total += (toppingPrice * toppingMultiplier * count)
        })
      }
    })
    return total.toFixed(2)
  }

  const handlePlaceOrder = () => {
    if (!customerName.trim()) {
      setMessage('❌ Please enter your name!')
      return
    }
    
    if (cart.length === 0) {
      setMessage('❌ Your cart is empty!')
      return
    }

    // Show payment modal
    setShowPaymentModal(true)
  }

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method)
    if (method === 'card') {
      setMessage('💳 Card payment not implemented yet. Please use cash.')
      setPaymentMethod('')
    }
  }

  const processCashPayment = async () => {
    const total = parseFloat(calculateTotal())
    const cash = parseFloat(cashAmount)

    if (!cash || cash <= 0) {
      setMessage('❌ Please enter a valid cash amount!')
      return
    }

    if (cash < total) {
      setMessage(`❌ Insufficient payment! Need $${total.toFixed(2)}`)
      return
    }

    const change = cash - total

    try {
      const orderData = {
        customerName: customerName,
        items: cart.map(item => ({
          type: item.type,
          size: item.size,
          crust: item.crust,
          sauce: item.sauce,
          cheese: item.cheese,
          toppings: Object.entries(item.toppings)
            .flatMap(([topping, count]) => Array(count).fill(topping))
        })),
        orderDate: new Date().toISOString(),
        cashTendered: cash,
        cashChange: change
      }

      const response = await orderAPI.createOrder(orderData)
      const actualTotal = response.data.totalPrice
      const actualChange = cash - actualTotal
      
      setMessage(`🎉 Order placed successfully! Total: $${actualTotal.toFixed(2)} | Your change: $${actualChange.toFixed(2)}`)
      setCart([])
      setCustomerName('')
      setShowPaymentModal(false)
      setPaymentMethod('')
      setCashAmount('')
      
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      setMessage('❌ Error placing order. Please try again.')
      console.error('Order error:', error)
    }
  }

  const cancelPayment = () => {
    setShowPaymentModal(false)
    setPaymentMethod('')
    setCashAmount('')
    setMessage('')
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
                <label>Size *</label>
                <select
                  value={currentItem.size}
                  onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value })}
                  required
                >
                  <option value="" disabled>-- Select Size --</option>
                  <option value="SMALL">Small (8") - $10.99</option>
                  <option value="MEDIUM">Medium (12") - $14.99</option>
                  <option value="LARGE">Large (16") - $18.99</option>
                </select>
              </div>

              <div className="form-group">
                <label>Crust *</label>
                <select
                  value={currentItem.crust}
                  onChange={(e) => setCurrentItem({ ...currentItem, crust: e.target.value })}
                  required
                >
                  <option value="" disabled>-- Select Crust --</option>
                  <option value="REGULAR">Regular</option>
                  <option value="THIN">Thin Crust</option>
                  <option value="THICK">Thick Crust</option>
                  <option value="STUFFED">
                    Stuffed Crust (+$
                    {currentItem.size === 'SMALL' ? '2.00' : 
                     currentItem.size === 'MEDIUM' ? '3.00' : 
                     currentItem.size === 'LARGE' ? '4.00' : '2.00-4.00'})
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Sauce *</label>
                <select
                  value={currentItem.sauce}
                  onChange={(e) => setCurrentItem({ ...currentItem, sauce: e.target.value })}
                  required
                >
                  <option value="" disabled>-- Select Sauce --</option>
                  <option value="MARINARA">Marinara</option>
                  <option value="BBQ">BBQ</option>
                  <option value="WHITE_GARLIC">White Garlic</option>
                  <option value="PESTO">Pesto</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cheese *</label>
                <select
                  value={currentItem.cheese}
                  onChange={(e) => setCurrentItem({ ...currentItem, cheese: e.target.value })}
                  required
                >
                  <option value="" disabled>-- Select Cheese --</option>
                  <option value="MOZZARELLA">Mozzarella</option>
                  <option value="CHEDDAR">Cheddar</option>
                  <option value="PARMESAN">Parmesan</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Toppings (click + to add, - to remove)</label>
                <div className="toppings-grid">
                  {toppingOptions.map(topping => {
                    const price = getToppingPriceForSize(topping, currentItem.size)
                    const count = getToppingCount(topping)
                    return (
                      <div key={topping} className="topping-item">
                        <div className="topping-name">{topping}</div>
                        <div className="topping-price">${price} each</div>
                        <div className="topping-controls">
                          <button
                            className="topping-control-btn"
                            onClick={() => removeTopping(topping)}
                            disabled={count === 0}
                          >
                            -
                          </button>
                          <span className="topping-count">{count}</span>
                          <button
                            className="topping-control-btn"
                            onClick={() => addTopping(topping)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
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
                    {cart.map((item, index) => {
                      const sizeMultiplier = item.size === 'SMALL' ? 1.0 : item.size === 'MEDIUM' ? 1.5 : 2.0
                      const stuffedCost = item.crust === 'STUFFED' ? (2.0 * sizeMultiplier).toFixed(2) : null
                      const pizzaPrice = calculatePizzaPrice(item)
                      return (
                        <div key={item.id} className="cart-item">
                          <div className="item-details">
                            <h3>Pizza #{index + 1}</h3>
                            <p><strong>Size:</strong> {item.size}</p>
                            <p><strong>Crust:</strong> {item.crust} {stuffedCost && `(+$${stuffedCost})`}</p>
                            <p><strong>Sauce:</strong> {item.sauce}</p>
                            <p><strong>Cheese:</strong> {item.cheese}</p>
                            {Object.keys(item.toppings).length > 0 && (
                              <p className="toppings"><strong>Toppings:</strong> {
                                Object.entries(item.toppings)
                                  .map(([topping, count]) => count > 1 ? `${topping} (×${count})` : topping)
                                  .join(', ')
                              }</p>
                            )}
                            <p className="pizza-price"><strong>Pizza Price: ${pizzaPrice}</strong></p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="btn-danger"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="cart-total">
                    <h3>Total: ${calculateTotal()}</h3>
                  </div>

                  <button onClick={handlePlaceOrder} className="btn-secondary full-width">
                    Place Order 🎉
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={cancelPayment}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>💳 Payment</h2>
              <div className="payment-info">
                <p><strong>Total Amount:</strong> ${calculateTotal()}</p>
              </div>

              {!paymentMethod ? (
                <div className="payment-methods">
                  <h3>Select Payment Method:</h3>
                  <button onClick={() => handlePaymentSelection('cash')} className="btn-primary payment-btn">
                    💵 Cash
                  </button>
                  <button onClick={() => handlePaymentSelection('card')} className="btn-primary payment-btn">
                    💳 Card (Not Available)
                  </button>
                </div>
              ) : paymentMethod === 'cash' ? (
                <div className="cash-payment">
                  <h3>Cash Payment</h3>
                  <div className="form-group">
                    <label>Enter Cash Amount:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter amount"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="customer-input"
                    />
                  </div>
                  {cashAmount && parseFloat(cashAmount) >= parseFloat(calculateTotal()) && (
                    <p className="change-info">
                      💰 Change: ${(parseFloat(cashAmount) - parseFloat(calculateTotal())).toFixed(2)}
                    </p>
                  )}
                  <div className="modal-actions">
                    <button onClick={processCashPayment} className="btn-secondary">
                      Confirm Payment
                    </button>
                    <button onClick={cancelPayment} className="btn-danger">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {!paymentMethod && (
                <div className="modal-actions">
                  <button onClick={cancelPayment} className="btn-danger">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewOrder

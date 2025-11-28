import React, { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import './NewOrder.css'

function NewOrder() {
  const [customerName, setCustomerName] = useState('')
  const [orderMode, setOrderMode] = useState('pizza') // 'pizza', 'drink', or 'garlicknots'
  const [pizzaMode, setPizzaMode] = useState('custom') // 'custom' or 'signature'
  const [selectedSignaturePizza, setSelectedSignaturePizza] = useState('')
  const [currentItem, setCurrentItem] = useState({
    type: 'pizza',
    size: '',
    crust: '',
    sauce: '',
    cheese: '',
    toppings: {} // Changed to object to track quantities: { 'Pepperoni': 2, 'Mushrooms': 1 }
  })
  const [currentDrink, setCurrentDrink] = useState({
    type: 'drink',
    drinkName: '',
    drinkSize: ''
  })
  const [currentGarlicKnots, setCurrentGarlicKnots] = useState({
    type: 'garlicknots',
    quantity: 1
  })
  const [cart, setCart] = useState([])
  const [message, setMessage] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [cashAmount, setCashAmount] = useState('')

  const drinkOptions = ['Coke', 'Sprite', 'Water', 'Fanta']
  const drinkSizes = {
    SMALL: 1.00,
    MEDIUM: 1.49,
    LARGE: 1.99
  }
  const garlicKnotsPrice = 5.00

  const signaturePizzas = {
    'Meat Lovers': {
      description: 'Loaded with pepperoni, beef, bacon, and sausage',
      crust: 'REGULAR',
      sauce: 'MARINARA',
      cheese: 'MOZZARELLA',
      toppings: { 'Pepperoni': 1, 'Beef': 1, 'Bacon': 1, 'Italian Sausage': 1 }
    },
    'Veggie Supreme': {
      description: 'Fresh veggies: mushrooms, peppers, onions, and olives',
      crust: 'REGULAR',
      sauce: 'MARINARA',
      cheese: 'MOZZARELLA',
      toppings: { 'Mushrooms': 1, 'Bell Peppers': 1, 'Onions': 1, 'Olives': 1 }
    },
    'Hawaiian': {
      description: 'Ham and pineapple on marinara',
      crust: 'REGULAR',
      sauce: 'MARINARA',
      cheese: 'MOZZARELLA',
      toppings: { 'Ham': 1, 'Pineapple': 1 }
    },
    'BBQ Chicken': {
      description: 'Grilled chicken with BBQ sauce, onions, and bell peppers',
      crust: 'REGULAR',
      sauce: 'BBQ',
      cheese: 'CHEDDAR',
      toppings: { 'Chicken': 1, 'Onions': 1, 'Bell Peppers': 1 }
    },
    'Margherita': {
      description: 'Classic: tomatoes, basil, and extra mozzarella',
      crust: 'REGULAR',
      sauce: 'MARINARA',
      cheese: 'MOZZARELLA',
      toppings: { 'Tomatoes': 1, 'Basil': 1, 'Extra Cheese': 1 }
    }
  }

  const toppingOptions = [
    'Pepperoni', 'Beef', 'Italian Sausage', 'Ham', 'Bacon', 'Chicken',
    'Salami', 'Anchovies', 'Extra Cheese', 'Extra Sauce', 'Mushrooms',
    'Bell Peppers', 'Onions', 'Olives', 'Tomatoes', 'Spinach',
    'Jalapeños', 'Pineapple', 'Basil', 'Garlic', 'Artichokes', 'Sun-dried Tomatoes'
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

  const selectSignaturePizza = (name) => {
    const pizza = signaturePizzas[name]
    setSelectedSignaturePizza(name)
    setCurrentItem({
      type: 'pizza',
      size: currentItem.size || '', // Keep size if already selected
      crust: pizza.crust,
      sauce: pizza.sauce,
      cheese: pizza.cheese,
      toppings: { ...pizza.toppings },
      signatureName: name
    })
  }

  const addToCart = () => {
    if (orderMode === 'pizza') {
      // Validate all required fields are selected
      if (!currentItem.size || !currentItem.crust || !currentItem.sauce || !currentItem.cheese) {
        setMessage('❌ Please select Size, Crust, Sauce, and Cheese!')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      setCart([...cart, { ...currentItem, id: Date.now() }])
      setMessage('✅ Pizza added to cart!')
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
      setSelectedSignaturePizza('')
    } else if (orderMode === 'drink') {
      // Validate drink selection
      if (!currentDrink.drinkName || !currentDrink.drinkSize) {
        setMessage('❌ Please select a drink and size!')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      setCart([...cart, { ...currentDrink, id: Date.now() }])
      setMessage('✅ Drink added to cart!')
      setTimeout(() => setMessage(''), 3000)
      
      // Reset drink selection
      setCurrentDrink({
        type: 'drink',
        drinkName: '',
        drinkSize: ''
      })
    } else if (orderMode === 'garlicknots') {
      // Validate garlic knots quantity
      if (!currentGarlicKnots.quantity || currentGarlicKnots.quantity < 1) {
        setMessage('❌ Please select a valid quantity!')
        setTimeout(() => setMessage(''), 3000)
        return
      }

      setCart([...cart, { ...currentGarlicKnots, id: Date.now() }])
      setMessage('✅ Garlic Knots added to cart!')
      setTimeout(() => setMessage(''), 3000)
      
      // Reset quantity
      setCurrentGarlicKnots({
        type: 'garlicknots',
        quantity: 1
      })
    }
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
      } else if (item.type === 'drink') {
        total += drinkSizes[item.drinkSize] || 0
      } else if (item.type === 'garlicknots') {
        total += garlicKnotsPrice * (item.quantity || 1)
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
        items: cart.map(item => {
          if (item.type === 'pizza') {
            return {
              type: item.type,
              size: item.size,
              crust: item.crust,
              sauce: item.sauce,
              cheese: item.cheese,
              signatureName: item.signatureName || null,
              toppings: Object.entries(item.toppings)
                .flatMap(([topping, count]) => Array(count).fill(topping))
            }
          } else if (item.type === 'drink') {
            return {
              type: item.type,
              drinkName: item.drinkName,
              drinkSize: item.drinkSize
            }
          } else if (item.type === 'garlicknots') {
            return {
              type: item.type,
              quantity: item.quantity
            }
          }
          return item
        }),
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
      console.error('Order error:', error)
      console.error('Error details:', error.response?.data)
      console.error('Order data sent:', orderData)
      setMessage('❌ Error placing order. Please try again.')
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
            {/* Order Mode Selection */}
            <div className="card">
              <h2>What would you like to order?</h2>
              <div className="order-mode-toggle">
                <button 
                  className={`toggle-btn ${orderMode === 'pizza' ? 'active' : ''}`}
                  onClick={() => setOrderMode('pizza')}
                >
                  🍕 Pizza
                </button>
                <button 
                  className={`toggle-btn ${orderMode === 'drink' ? 'active' : ''}`}
                  onClick={() => setOrderMode('drink')}
                >
                  🥤 Drinks
                </button>
                <button 
                  className={`toggle-btn ${orderMode === 'garlicknots' ? 'active' : ''}`}
                  onClick={() => setOrderMode('garlicknots')}
                >
                  🧄 Garlic Knots
                </button>
              </div>
            </div>

            {/* Pizza Section */}
            {orderMode === 'pizza' && (
              <div className="card">
                <h2>Build Your Pizza</h2>
                
                {/* Pizza Mode Toggle */}
                <div className="form-group">
                  <label>Pizza Type</label>
                  <div className="pizza-mode-toggle">
                    <button 
                      className={`toggle-btn ${pizzaMode === 'custom' ? 'active' : ''}`}
                      onClick={() => {
                        setPizzaMode('custom')
                        setSelectedSignaturePizza('')
                        setCurrentItem({
                          type: 'pizza',
                          size: currentItem.size,
                          crust: '',
                          sauce: '',
                          cheese: '',
                          toppings: {}
                        })
                      }}
                    >
                      🍕 Custom Pizza
                    </button>
                    <button 
                      className={`toggle-btn ${pizzaMode === 'signature' ? 'active' : ''}`}
                      onClick={() => {
                        setPizzaMode('signature')
                        setCurrentItem({
                          type: 'pizza',
                          size: currentItem.size,
                          crust: '',
                          sauce: '',
                          cheese: '',
                          toppings: {}
                        })
                      }}
                    >
                    ⭐ Signature Pizza
                  </button>
                </div>
              </div>

              {/* Signature Pizza Selection */}
              {pizzaMode === 'signature' && (
                <div className="form-group">
                  <label>Choose Signature Pizza *</label>
                  <div className="signature-pizza-grid">
                    {Object.entries(signaturePizzas).map(([name, details]) => (
                      <div
                        key={name}
                        className={`signature-pizza-card ${selectedSignaturePizza === name ? 'selected' : ''}`}
                        onClick={() => selectSignaturePizza(name)}
                      >
                        <h3>{name}</h3>
                        <p className="signature-description">{details.description}</p>
                        <div className="signature-toppings">
                          {Object.keys(details.toppings).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Only show customization for custom pizzas */}
              {pizzaMode === 'custom' && (
                <>
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
                </>
              )}

              {/* Show customization options for signature pizzas */}
              {pizzaMode === 'signature' && selectedSignaturePizza && (
                <>
                  <div className="signature-customization">
                    <h3>Customize Your {selectedSignaturePizza}</h3>

                    <div className="form-group">
                      <label>Crust</label>
                      <select
                        value={currentItem.crust}
                        onChange={(e) => setCurrentItem({ ...currentItem, crust: e.target.value })}
                      >
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

                    <div className="config-item-box">
                      <strong>Included Toppings:</strong> {Object.keys(currentItem.toppings).join(', ')}
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>
                  {pizzaMode === 'signature' ? 'Additional Toppings (optional)' : 'Toppings (click + to add, - to remove)'}
                </label>
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
            )}

            {/* Drinks Section */}
            {orderMode === 'drink' && (
              <div className="card">
                <h2>Select a Drink</h2>

                <div className="form-group">
                  <label>Drink *</label>
                  <select
                    value={currentDrink.drinkName}
                    onChange={(e) => setCurrentDrink({ ...currentDrink, drinkName: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Select Drink --</option>
                    {drinkOptions.map(drink => (
                      <option key={drink} value={drink}>{drink}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Size *</label>
                  <select
                    value={currentDrink.drinkSize}
                    onChange={(e) => setCurrentDrink({ ...currentDrink, drinkSize: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Select Size --</option>
                    <option value="SMALL">Small - ${drinkSizes.SMALL.toFixed(2)}</option>
                    <option value="MEDIUM">Medium - ${drinkSizes.MEDIUM.toFixed(2)}</option>
                    <option value="LARGE">Large - ${drinkSizes.LARGE.toFixed(2)}</option>
                  </select>
                </div>

                {currentDrink.drinkName && currentDrink.drinkSize && (
                  <div className="price-display">
                    <strong>Price: ${drinkSizes[currentDrink.drinkSize].toFixed(2)}</strong>
                  </div>
                )}

                <button onClick={addToCart} className="btn-primary full-width">
                  Add to Cart
                </button>
              </div>
            )}

            {/* Garlic Knots Section */}
            {orderMode === 'garlicknots' && (
              <div className="card">
                <h2>Order Garlic Knots</h2>

                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={currentGarlicKnots.quantity}
                    onChange={(e) => setCurrentGarlicKnots({ ...currentGarlicKnots, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div className="price-display">
                  <strong>Price per order: ${garlicKnotsPrice.toFixed(2)}</strong>
                  <br />
                  <strong>Total: ${(garlicKnotsPrice * currentGarlicKnots.quantity).toFixed(2)}</strong>
                </div>

                <button onClick={addToCart} className="btn-primary full-width">
                  Add to Cart
                </button>
              </div>
            )}

            {/* Pizza Preview */}
            {orderMode === 'pizza' && currentItem.size && (
              <div className="card pizza-preview-card">
                <h2>Pizza Preview</h2>
                <div className="pizza-preview">
                  <div className={`pizza-visual pizza-size-${currentItem.size.toLowerCase()}`}>
                    {/* Pizza base */}
                    <div className="pizza-base">
                      {/* Sauce layer */}
                      <div className={`pizza-sauce sauce-${currentItem.sauce?.toLowerCase() || 'none'}`}></div>

                      {/* Cheese layer */}
                      <div className={`pizza-cheese cheese-${currentItem.cheese?.toLowerCase() || 'none'}`}></div>

                      {/* Toppings */}
                      <div className="pizza-toppings">
                        {Object.entries(currentItem.toppings).map(([topping, count], idx) => {
                          // Create visual representation for each topping instance
                          return Array.from({ length: Math.min(count, 8) }).map((_, i) => (
                            <div
                              key={`${topping}-${i}`}
                              className={`topping topping-${topping.toLowerCase().replace(/\s+/g, '-')}`}
                              style={{
                                top: `${15 + (idx * 12 + i * 8) % 60}%`,
                                left: `${15 + (idx * 15 + i * 11) % 60}%`,
                                transform: `rotate(${idx * 30 + i * 45}deg)`
                              }}
                            ></div>
                          ))
                        })}
                      </div>

                      {/* Crust indicator */}
                      <div className={`pizza-crust crust-${currentItem.crust?.toLowerCase() || 'regular'}`}></div>
                    </div>
                  </div>

                  <div className="pizza-info">
                    <p className="size-label">{currentItem.size} Pizza</p>
                    {currentItem.signatureName && (
                      <p className="signature-label">⭐ {currentItem.signatureName}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                      if (item.type === 'pizza') {
                        const sizeMultiplier = item.size === 'SMALL' ? 1.0 : item.size === 'MEDIUM' ? 1.5 : 2.0
                        const stuffedCost = item.crust === 'STUFFED' ? (2.0 * sizeMultiplier).toFixed(2) : null
                        const pizzaPrice = calculatePizzaPrice(item)
                        return (
                          <div key={item.id} className="cart-item">
                            <div className="item-details">
                              <h3>{item.signatureName ? `⭐ ${item.signatureName}` : `🍕 Pizza #${index + 1}`}</h3>
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
                              <p className="pizza-price"><strong>Price: ${pizzaPrice}</strong></p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      } else if (item.type === 'drink') {
                        return (
                          <div key={item.id} className="cart-item">
                            <div className="item-details">
                              <h3>🥤 {item.drinkName}</h3>
                              <p><strong>Size:</strong> {item.drinkSize}</p>
                              <p className="pizza-price"><strong>Price: ${drinkSizes[item.drinkSize].toFixed(2)}</strong></p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      } else if (item.type === 'garlicknots') {
                        return (
                          <div key={item.id} className="cart-item">
                            <div className="item-details">
                              <h3>🧄 Garlic Knots</h3>
                              <p><strong>Quantity:</strong> {item.quantity}</p>
                              <p className="pizza-price"><strong>Price: ${(garlicKnotsPrice * item.quantity).toFixed(2)}</strong></p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="btn-danger"
                            >
                              Remove
                            </button>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>

                  <div className="cart-total">
                    <h3>Total: ${calculateTotal()}</h3>
                  </div>

                  <div className="customer-info-checkout">
                    <h3>Your Name</h3>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="customer-input"
                      required
                    />
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
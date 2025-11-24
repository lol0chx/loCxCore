import React, { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import './Ledger.css'

function Ledger() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [filterDay, setFilterDay] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, filterYear, filterMonth, filterDay])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getAllOrders()
      // Sort orders by date in descending order (newest first)
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.orderDate) - new Date(a.orderDate)
      )
      setOrders(sortedOrders)
      setError('')
    } catch (err) {
      setError('Failed to load orders. Make sure the backend is running.')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Search by receipt ID (order ID) or customer name
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by year
    if (filterYear) {
      filtered = filtered.filter(order => {
        const orderYear = new Date(order.orderDate).getFullYear().toString()
        return orderYear === filterYear
      })
    }

    // Filter by month
    if (filterMonth) {
      filtered = filtered.filter(order => {
        const orderMonth = (new Date(order.orderDate).getMonth() + 1).toString().padStart(2, '0')
        return orderMonth === filterMonth
      })
    }

    // Filter by day
    if (filterDay) {
      filtered = filtered.filter(order => {
        const orderDay = new Date(order.orderDate).getDate().toString().padStart(2, '0')
        return orderDay === filterDay
      })
    }

    setFilteredOrders(filtered)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDateOnly = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTimeOnly = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterYear('')
    setFilterMonth('')
    setFilterDay('')
  }

  const getAvailableYears = () => {
    const years = new Set(orders.map(order => new Date(order.orderDate).getFullYear()))
    return Array.from(years).sort((a, b) => b - a)
  }

  if (loading) {
    return (
      <div className="ledger-container">
        <div className="container">
          <h1 className="page-title">📊 Order Ledger</h1>
          <div className="loading">Loading orders...</div>
        </div>
      </div>
    )
  }

  // Show order details view
  if (selectedOrder) {
    console.log('Selected Order:', selectedOrder)
    console.log('Order Items:', selectedOrder.items)
    if (selectedOrder.items && selectedOrder.items.length > 0) {
      console.log('First Item:', selectedOrder.items[0])
    }
    
    return (
      <div className="ledger-container">
        <div className="container">
          <h1 className="page-title">📊 Order Details</h1>
          
          <button onClick={() => setSelectedOrder(null)} className="btn-secondary back-btn">
            ← Back to Transactions
          </button>

          <div className="order-detail-card">
            <div className="order-header">
              <div>
                <h2>Order #{selectedOrder.dailyOrderNumber || 'N/A'}</h2>
                <p className="receipt-id-subtitle">
                  Receipt ID: {(() => {
                    const orderDate = new Date(selectedOrder.orderDate)
                    const timestamp = orderDate.toISOString().slice(0,10).replace(/-/g,'') + '-' + 
                                    orderDate.toTimeString().slice(0,8).replace(/:/g,'')
                    return `${selectedOrder.id}-${timestamp}`
                  })()}
                </p>
                <p className="receipt-id-subtitle">Order No: {selectedOrder.id}</p>
              </div>
              <span className={`status ${selectedOrder.status.toLowerCase()}`}>
                {selectedOrder.status}
              </span>
            </div>

            <div className="order-info">
              <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p><strong>Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
              <p><strong>Items:</strong> {selectedOrder.items?.length || 0}</p>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div className="order-items">
                <h3>Items:</h3>
                {selectedOrder.items.map((item, index) => {
                  console.log(`Item ${index + 1}:`, item)
                  
                  // Check item type from discriminator column
                  const itemType = item.itemType || 'PIZZA'
                  
                  // Render Drink
                  if (itemType === 'DRINK') {
                    const drinkSize = typeof item.size === 'string' ? item.size : (item.size?.name || 'N/A')
                    return (
                      <div key={index} className="item-detail">
                        <h4>🥤 {item.drinkName || item.name}</h4>
                        <p><strong>Size:</strong> {drinkSize}</p>
                        <p className="item-price"><strong>Total:</strong> ${item.basePrice?.toFixed(2) || '0.00'}</p>
                      </div>
                    )
                  }
                  
                  // Render Garlic Knots
                  if (itemType === 'GARLIC_KNOTS') {
                    return (
                      <div key={index} className="item-detail">
                        <h4>🧄 {item.name}</h4>
                        <p><strong>Quantity:</strong> {item.quantity || 1}</p>
                        <p className="item-price"><strong>Total:</strong> ${item.basePrice?.toFixed(2) || '0.00'}</p>
                      </div>
                    )
                  }
                  
                  // Render Pizza (default)
                  // Handle both string and object enum values
                  const size = typeof item.size === 'string' ? item.size : (item.size?.name || 'N/A')
                  const crust = typeof item.crust === 'string' ? item.crust : (item.crust?.name || 'N/A')
                  const sauce = typeof item.sauce === 'string' ? item.sauce : (item.sauce?.name || 'N/A')
                  const cheese = typeof item.cheese === 'string' ? item.cheese : (item.cheese?.name || 'N/A')
                  
                  // Calculate pizza price
                  const sizeMultiplier = size === 'SMALL' ? 1.0 : size === 'MEDIUM' ? 1.5 : 2.0
                  const sizePrice = size === 'SMALL' ? 10.99 : size === 'MEDIUM' ? 14.99 : 18.99
                  const crustExtra = crust === 'STUFFED' ? (2.0 * sizeMultiplier) : 0
                  
                  // Handle toppings - could be toppingsMap or object with name keys
                  let toppingsDisplay = null
                  if (item.toppingsMap && typeof item.toppingsMap === 'object') {
                    const toppingEntries = Object.entries(item.toppingsMap)
                    if (toppingEntries.length > 0) {
                      toppingsDisplay = (
                        <div className="toppings-detail">
                          <strong>Toppings:</strong>
                          <ul>
                            {toppingEntries.map(([key, value]) => {
                              // Handle if key is an object with name property or just a string
                              const toppingName = typeof key === 'string' ? key : (key?.name || 'Unknown')
                              const count = typeof value === 'number' ? value : (value?.count || 1)
                              return (
                                <li key={toppingName}>
                                  {toppingName} {count > 1 ? `(×${count})` : ''}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )
                    }
                  }
                  
                  return (
                    <div key={index} className="item-detail">
                      <h4>{item.signatureName ? `⭐ ${item.signatureName}` : `🍕 Pizza #${index + 1}`}</h4>
                      <p><strong>Size:</strong> {size} - ${sizePrice.toFixed(2)}</p>
                      <p><strong>Crust:</strong> {crust} {crustExtra > 0 && `(+$${crustExtra.toFixed(2)})`}</p>
                      <p><strong>Sauce:</strong> {sauce}</p>
                      <p><strong>Cheese:</strong> {cheese}</p>
                      {toppingsDisplay || <p><strong>Toppings:</strong> None</p>}
                      <p className="item-price"><strong>Pizza Total:</strong> ${item.basePrice?.toFixed(2) || (sizePrice + crustExtra).toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="order-footer">
              <div className="order-total-large">
                <strong>Total:</strong> ${selectedOrder.totalPrice?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show transactions list view
  return (
    <div className="ledger-container">
      <div className="container">
        <h1 className="page-title">📊 Order Ledger</h1>

        {error && <div className="error-message">{error}</div>}

        {/* Search and Filter Section */}
        <div className="card filter-section">
          <div className="filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search by Receipt ID or Customer Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={filterYear} 
                onChange={(e) => setFilterYear(e.target.value)}
                className="filter-select"
              >
                <option value="">All Years</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(e.target.value)}
                className="filter-select"
              >
                <option value="">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              <select 
                value={filterDay} 
                onChange={(e) => setFilterDay(e.target.value)}
                className="filter-select"
              >
                <option value="">All Days</option>
                {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString().padStart(2, '0')}>
                    {day}
                  </option>
                ))}
              </select>

              {(searchTerm || filterYear || filterMonth || filterDay) && (
                <button onClick={clearFilters} className="btn-secondary clear-btn">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
          
          <div className="results-count">
            Showing {filteredOrders.length} of {orders.length} transactions
          </div>
        </div>

        {/* Transactions Table */}
        {orders.length === 0 ? (
          <div className="card">
            <p className="empty-message">No orders yet. Create your first order!</p>
          </div>
        ) : (
          <div className="card">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Receipt ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-results">
                      No transactions found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const orderDate = new Date(order.orderDate)
                    const timestamp = orderDate.toISOString().slice(0,10).replace(/-/g,'') + '-' + 
                                    orderDate.toTimeString().slice(0,8).replace(/:/g,'')
                    const receiptId = `${order.id}-${timestamp}`
                    
                    return (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="transaction-row"
                      >
                        <td className="order-number">#{order.dailyOrderNumber || '-'}</td>
                        <td className="receipt-id-cell">{receiptId}</td>
                        <td>{formatDateOnly(order.orderDate)}</td>
                        <td>{formatTimeOnly(order.orderDate)}</td>
                        <td>{order.customerName}</td>
                        <td>${order.totalPrice?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-view"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOrder(order)
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ledger

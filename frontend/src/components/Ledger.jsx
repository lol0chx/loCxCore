import React, { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'
import './Ledger.css'

function Ledger() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getAllOrders()
      setOrders(response.data)
      setError('')
    } catch (err) {
      setError('Failed to load orders. Make sure the backend is running.')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.deleteOrder(id)
        fetchOrders()
      } catch (err) {
        alert('Failed to delete order')
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
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

  return (
    <div className="ledger-container">
      <div className="container">
        <h1 className="page-title">📊 Order Ledger</h1>

        {error && <div className="error-message">{error}</div>}

        {orders.length === 0 ? (
          <div className="card">
            <p className="empty-message">No orders yet. Create your first order!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id}</h3>
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-info">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Date:</strong> {formatDate(order.orderDate)}</p>
                  <p><strong>Items:</strong> {order.items?.length || 0}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="order-items">
                    <h4>Items:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name || 'Pizza'} - {item.size || 'Medium'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="order-footer">
                  <div className="order-total">
                    <strong>Total:</strong> ${order.totalPrice?.toFixed(2) || '0.00'}
                  </div>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Ledger

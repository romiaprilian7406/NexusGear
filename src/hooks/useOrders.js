import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import useAuthStore from '../stores/authStore'

// Hook untuk order milik user yang login
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuthStore()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          setOrders(data || [])
        }
        setLoading(false)
      })
  }, [user?.id])

  return { orders, loading, error }
}

// Hook untuk admin: semua order
export function useAllOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            id,
            full_name,
            email:id
          ),
          order_items (
            id,
            quantity,
            price_at_purchase,
            products (
              id,
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err.message)
      console.error('useAllOrders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { orders, loading, error, updateStatus, refetch: fetchOrders }
}

// Hook untuk create order
export function useCreateOrder() {
  const [submitting, setSubmitting] = useState(false)

  const createOrder = async ({ userId, orderData, items }) => {
    setSubmitting(true)
    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total_amount: orderData.total_amount,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method,
          notes: orderData.notes || null,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      return { success: true, orderId: order.id, order }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setSubmitting(false)
    }
  }

  return { createOrder, submitting }
}

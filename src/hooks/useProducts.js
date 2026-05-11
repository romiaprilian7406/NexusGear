import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../lib/utils'

const USE_MOCK = false // Set to false when Supabase is configured

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*, categories(*)')

      // Filter featured — pastikan ini ada
      if (filters.featured === true) {
        query = query.eq('is_featured', true)
      }

      if (filters.category_id) query = query.eq('category_id', filters.category_id)
      if (filters.search) query = query.ilike('name', `%${filters.search}%`)
      if (filters.minPrice) query = query.gte('price', filters.minPrice)
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice)
      if (filters.minRating) query = query.gte('rating', filters.minRating)

      if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
      else if (filters.sort === 'rating') query = query.order('rating', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}

export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    if (USE_MOCK) {
      const found = MOCK_PRODUCTS.find((p) => p.id === parseInt(id))
      setProduct(found || null)
      setLoading(false)
    } else {
      supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single()
        .then(({ data }) => { setProduct(data); setLoading(false) })
    }
  }, [id])

  return { product, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK) {
      setCategories(MOCK_CATEGORIES)
      setLoading(false)
    } else {
      supabase.from('categories').select('*').then(({ data }) => {
        setCategories(data || [])
        setLoading(false)
      })
    }
  }, [])

  return { categories, loading }
}

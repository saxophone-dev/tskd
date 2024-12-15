import { Hono } from 'hono'
import { decode, sign, verify } from 'hono/jwt'
import { cors } from 'hono/cors'
import { hash, compare, genSalt } from '@node-rs/bcrypt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  REFRESH_SECRET: string
  SHEETY_SECRET: string
}
type User = {
  id: string
  email: string
  username: string
  password: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors())

// Authentication Middleware
const authenticateToken = async (c: any, next: any) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  if (!token) {
    return c.json({ error: 'Access token required' }, 401)
  }
  try {
    const payload = await verify(token, c.env.JWT_SECRET)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 403)
  }
}

// Token Generation
const generateAccessToken = (user: Partial<User>, secret: string) =>
  sign(
    {
      id: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day
    },
    secret
  )

const saveRefreshToken = async (c: any, userId: string, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  await c.env.DB.prepare(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(crypto.randomUUID(), userId, refreshToken, expiresAt.toISOString()).run()
}

// Signup Route
app.post('/auth/signup', async (c) => {
  const { email, password, username } = await c.req.json()
  if (!email || !password || !username) {
    return c.json({ error: 'Email, password, and username are required' }, 400)
  }
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).all()
  if (results.length > 0) {
    return c.json({ error: 'User already exists' }, 400)
  }
  const hashedPassword = await hash(password, 10)
  const userId = crypto.randomUUID()
  await c.env.DB.prepare(
    'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)'
  ).bind(userId, email, username, hashedPassword).run()
  const accessToken = await generateAccessToken({ id: userId, email }, c.env.JWT_SECRET)
  const refreshToken = await generateAccessToken({ id: userId, email }, c.env.REFRESH_SECRET)
  await saveRefreshToken(c, userId, refreshToken)
  return c.json({
    tokens: { accessToken, refreshToken },
    user: { id: userId, email, username }
  })
})

// Login Route
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).all()
  if (results.length === 0) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }
  const user = results[0]
  const isPasswordValid = await compare(password, user.password)
  if (!isPasswordValid) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }
  const accessToken = await generateAccessToken({ id: user.id, email }, c.env.JWT_SECRET)
  const refreshToken = await generateAccessToken({ id: user.id, email }, c.env.REFRESH_SECRET)
  await saveRefreshToken(c, user.id, refreshToken)
  return c.json({
    tokens: { accessToken, refreshToken },
    user: { id: user.id, email, username: user.username }
  })
})

// Refresh Token Route
app.post('/auth/refresh', async (c) => {
  const { refreshToken } = await c.req.json()
  if (!refreshToken) {
    return c.json({ error: 'Refresh token is required' }, 400)
  }
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM refresh_tokens WHERE token = ?'
  ).bind(refreshToken).all()
  if (results.length === 0) {
    return c.json({ error: 'Invalid refresh token' }, 403)
  }
  const storedToken = results[0]
  if (new Date(storedToken.expires_at) < new Date()) {
    return c.json({ error: 'Refresh token expired' }, 403)
  }
  const payload = await verify(refreshToken, c.env.REFRESH_SECRET)
  const newAccessToken = await generateAccessToken(payload, c.env.JWT_SECRET)
  return c.json({ accessToken: newAccessToken })
})

// Logout Route
app.post('/auth/logout', async (c) => {
  const { refreshToken } = await c.req.json()
  if (!refreshToken) {
    return c.json({ error: 'Refresh token is required' }, 400)
  }
  await c.env.DB.prepare(
    'DELETE FROM refresh_tokens WHERE token = ?'
  ).bind(refreshToken).run()
  return c.json({ success: true })
})

// Feedback Route
app.post('/api/feedback', async (c) => {
  const { email, message } = await c.req.json()
  if (!email || !message) {
    return c.json({ error: "Both 'email' and 'message' are required" }, 400)
  }
  const sheetyUrl =
    'https://api.sheety.co/2870e9315faaeee780eaf2deae61d926/tskdFeedback/feedback'
  try {
    const response = await fetch(sheetyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.SHEETY_SECRET}`
      },
      body: JSON.stringify({
        feedback: { email, message }
      })
    })
    if (!response.ok) {
      const error = await response.json()
      return c.json({
        error: error.message || 'Failed to send feedback'
      }, response.status)
    }
    const data = await response.json()
    return c.json({ success: true, feedback: data.feedback })
  } catch (err) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Protected Route
app.get('/api/protected', authenticateToken, (c) => {
  return c.json({
    message: 'This is a protected route',
    user: c.get('user')
  })
})

export default app


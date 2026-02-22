import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data.json')

function load() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(data)
  } catch {
    return { users: [], otps: [] }
  }
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export function getUsers() {
  return load().users
}

export function addUser(user) {
  const data = load()
  const id = data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1
  const newUser = { ...user, id }
  data.users.push(newUser)
  save(data)
  return newUser
}

export function findUserByEmail(email) {
  return load().users.find(u => u.email === email?.toLowerCase())
}

export function findUserByPhone(phone) {
  const p = String(phone).replace(/\s/g, '')
  return load().users.find(u => u.phone && u.phone.replace(/\s/g, '') === p)
}

export function findUser(identifier) {
  const id = String(identifier).trim().toLowerCase()
  if (id.includes('@')) return findUserByEmail(id)
  return findUserByPhone(id)
}

export function updateUser(id, updates) {
  const data = load()
  const idx = data.users.findIndex(u => u.id === id)
  if (idx === -1) return null
  data.users[idx] = { ...data.users[idx], ...updates }
  save(data)
  return data.users[idx]
}

export function addOTP(identifier, code, type) {
  const data = load()
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes, single-use (removed on verify)
  data.otps.push({ identifier: identifier.toLowerCase(), code, type, expiresAt })
  save(data)
}

export function verifyAndRemoveOTP(identifier, code, type) {
  const data = load()
  const idx = data.otps.findIndex(
    o => o.identifier === identifier.toLowerCase() && o.code === code && o.type === type && o.expiresAt > Date.now()
  )
  if (idx === -1) return false
  data.otps.splice(idx, 1)
  save(data)
  return true
}

export function setPendingRegister(identifier, passwordHash) {
  const data = load()
  if (!data.pending) data.pending = {}
  data.pending[identifier.toLowerCase()] = { passwordHash, at: Date.now() }
  save(data)
}

export function getAndRemovePendingRegister(identifier) {
  const data = load()
  if (!data.pending) return null
  const key = identifier.toLowerCase()
  const p = data.pending[key]
  if (!p || Date.now() - p.at > 30 * 60 * 1000) return null // 30 min expiry
  delete data.pending[key]
  save(data)
  return p.passwordHash
}

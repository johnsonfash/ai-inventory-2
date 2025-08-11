"use client"

import type { Role } from "./rbac"

export type User = {
  id: string
  name: string
  email: string
  role: Role
  group?: string
}

export type Group = { id: string; name: string; role: Role }

const KEY_USERS = "auth:users"
const KEY_GROUPS = "auth:groups"
const KEY_CURRENT = "auth:current"

const DEFAULT_USERS: User[] = [
  { id: "u1", name: "Alex Larson", email: "alex@acme.com", role: "Admin" },
  { id: "u2", name: "Mia Chen", email: "mia@acme.com", role: "Viewer" },
  { id: "u3", name: "Sam Sales", email: "sam@acme.com", role: "Sales" },
  { id: "u4", name: "Mary Marketing", email: "mary@acme.com", role: "Marketing" },
]
const DEFAULT_GROUPS: Group[] = [
  { id: "g1", name: "HQ", role: "Manager" },
  { id: "g2", name: "Floor", role: "Sales" },
]

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function setLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function initAuthDemo() {
  if (!localStorage.getItem(KEY_USERS)) setLS(KEY_USERS, DEFAULT_USERS)
  if (!localStorage.getItem(KEY_GROUPS)) setLS(KEY_GROUPS, DEFAULT_GROUPS)
  if (!localStorage.getItem(KEY_CURRENT)) setLS(KEY_CURRENT, DEFAULT_USERS[0])
}

export function listUsers() {
  return getLS<User[]>(KEY_USERS, DEFAULT_USERS)
}
export function listGroups() {
  return getLS<Group[]>(KEY_GROUPS, DEFAULT_GROUPS)
}
export function currentUser(): User | null {
  return getLS<User | null>(KEY_CURRENT, DEFAULT_USERS[0])
}
export function setCurrentUser(u: User) {
  setLS(KEY_CURRENT, u)
}

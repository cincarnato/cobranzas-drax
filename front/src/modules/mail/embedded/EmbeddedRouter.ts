import {shallowReactive} from "vue";
import type {Component} from "vue";
import type {Router} from "vue-router";
import {useAuth} from "@drax/identity-vue";

type EmbeddedQueryValue = string | number | boolean | null | undefined | EmbeddedQueryValue[]
type EmbeddedQuery = Record<string, EmbeddedQueryValue>

interface EmbeddedLocation {
  path: string
  query?: EmbeddedQuery
}

interface EmbeddedRoute {
  path: string
  component: () => Promise<Component | {default: Component}>
  props?: (location: EmbeddedLocation) => Record<string, unknown>
  permission?: string | string[]
  auth?: boolean
}

interface EmbeddedRouterState {
  opened: boolean
  location: EmbeddedLocation | null
  route: EmbeddedRoute | null
  componentProps: Record<string, unknown>
  instanceKey: number
}

const registry = new Map<string, EmbeddedRoute>()
const state = shallowReactive<EmbeddedRouterState>({
  opened: false,
  location: null,
  route: null,
  componentProps: {},
  instanceKey: 0,
})

let vueRouter: Router | null = null

function setRouter(router: Router) {
  vueRouter = router
}

function register(route: EmbeddedRoute) {
  registry.set(normalizePath(route.path), {
    ...route,
    path: normalizePath(route.path),
  })
}

function open(location: EmbeddedLocation) {
  const normalizedLocation = normalizeLocation(location)
  const route = registry.get(normalizedLocation.path)

  if (!route) {
    return fallbackToRouter(normalizedLocation)
  }

  if (!canOpen(route)) {
    return redirectToLogin(normalizedLocation)
  }

  state.opened = true
  state.location = normalizedLocation
  state.route = route
  state.componentProps = route.props ? route.props(normalizedLocation) : {...normalizedLocation.query}
  state.instanceKey += 1
}

function close() {
  state.opened = false
  state.location = null
  state.route = null
  state.componentProps = {}
  state.instanceKey += 1
}

function canOpen(route: EmbeddedRoute) {
  const requiresAuth = route.auth !== false
  const permissions = Array.isArray(route.permission)
    ? route.permission
    : route.permission
      ? [route.permission]
      : []

  if (!requiresAuth && !permissions.length) return true

  const {isAuthenticated, hasPermission} = useAuth()
  if (requiresAuth && !isAuthenticated()) return false

  return permissions.every((permission) => hasPermission(permission))
}

function fallbackToRouter(location: EmbeddedLocation) {
  if (!vueRouter) return
  return vueRouter.push({
    path: location.path,
    query: queryToRouterQuery(location.query),
  })
}

function redirectToLogin(location: EmbeddedLocation) {
  if (!vueRouter) return
  return vueRouter.push({
    path: "/login",
    query: {redirect: locationToFullPath(location)},
  })
}

function normalizeLocation(location: EmbeddedLocation): EmbeddedLocation {
  const parsed = parsePath(location.path)
  return {
    path: parsed.path,
    query: {
      ...parsed.query,
      ...(location.query || {}),
    },
  }
}

function parsePath(value: string): EmbeddedLocation {
  try {
    const parsed = new URL(value, window.location.origin)
    return {
      path: normalizePath(parsed.pathname),
      query: searchParamsToQuery(parsed.searchParams),
    }
  } catch {
    const [pathAndQuery] = value.split("#")
    const [path, search = ""] = pathAndQuery.split("?")
    return {
      path: normalizePath(path),
      query: searchParamsToQuery(new URLSearchParams(search)),
    }
  }
}

function searchParamsToQuery(searchParams: URLSearchParams) {
  const query: EmbeddedQuery = {}
  searchParams.forEach((value, key) => {
    query[key] = value
  })
  return query
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`
}

function queryToRouterQuery(query?: EmbeddedQuery) {
  return Object.entries(query || {}).reduce<Record<string, any>>((result, [key, value]) => {
    if (value !== undefined && value !== null) result[key] = value
    return result
  }, {})
}

function locationToFullPath(location: EmbeddedLocation) {
  const search = new URLSearchParams()
  Object.entries(queryToRouterQuery(location.query)).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)))
      return
    }
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `${location.path}?${query}` : location.path
}

const embeddedRouter = {
  state,
  setRouter,
  register,
  open,
  close,
}

export default embeddedRouter
export {embeddedRouter}
export type {EmbeddedLocation, EmbeddedRoute, EmbeddedQuery}

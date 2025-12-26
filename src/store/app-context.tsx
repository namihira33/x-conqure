"use client"

import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { AppState, XApiCredentials, XUser, XTweet, QuoteRetweet } from "@/types"

// 初期状態
const initialState: AppState = {
  credentials: null,
  isAuthenticated: false,
  currentUser: null,
  following: [],
  followers: [],
  oneWayFollowing: [],
  searchResults: [],
  tweetSearchResults: [],
  quoteRetweets: [],
  loading: {
    auth: false,
    following: false,
    followers: false,
    search: false,
    action: false,
  },
  error: null,
}

// アクションタイプ
type AppAction =
  | { type: "SET_CREDENTIALS"; payload: XApiCredentials }
  | { type: "CLEAR_CREDENTIALS" }
  | { type: "SET_AUTHENTICATED"; payload: boolean }
  | { type: "SET_CURRENT_USER"; payload: XUser | null }
  | { type: "SET_FOLLOWING"; payload: XUser[] }
  | { type: "SET_FOLLOWERS"; payload: XUser[] }
  | { type: "SET_ONE_WAY_FOLLOWING"; payload: XUser[] }
  | { type: "SET_SEARCH_RESULTS"; payload: XUser[] }
  | { type: "SET_TWEET_SEARCH_RESULTS"; payload: XTweet[] }
  | { type: "ADD_QUOTE_RETWEET"; payload: QuoteRetweet }
  | { type: "REMOVE_QUOTE_RETWEET"; payload: string }
  | { type: "SET_LOADING"; payload: { key: keyof AppState["loading"]; value: boolean } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "REMOVE_FROM_FOLLOWING"; payload: string }
  | { type: "ADD_TO_FOLLOWING"; payload: XUser }

// リデューサー
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CREDENTIALS":
      return { ...state, credentials: action.payload }
    case "CLEAR_CREDENTIALS":
      return { ...state, credentials: null, isAuthenticated: false, currentUser: null }
    case "SET_AUTHENTICATED":
      return { ...state, isAuthenticated: action.payload }
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload }
    case "SET_FOLLOWING":
      return { ...state, following: action.payload }
    case "SET_FOLLOWERS":
      return { ...state, followers: action.payload }
    case "SET_ONE_WAY_FOLLOWING":
      return { ...state, oneWayFollowing: action.payload }
    case "SET_SEARCH_RESULTS":
      return { ...state, searchResults: action.payload }
    case "SET_TWEET_SEARCH_RESULTS":
      return { ...state, tweetSearchResults: action.payload }
    case "ADD_QUOTE_RETWEET":
      return { ...state, quoteRetweets: [...state.quoteRetweets, action.payload] }
    case "REMOVE_QUOTE_RETWEET":
      return {
        ...state,
        quoteRetweets: state.quoteRetweets.filter(
          (qr) => qr.originalTweet.id !== action.payload
        ),
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "REMOVE_FROM_FOLLOWING":
      return {
        ...state,
        following: state.following.filter((u) => u.id !== action.payload),
        oneWayFollowing: state.oneWayFollowing.filter((u) => u.id !== action.payload),
      }
    case "ADD_TO_FOLLOWING":
      return {
        ...state,
        following: [...state.following, action.payload],
      }
    default:
      return state
  }
}

// コンテキスト
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// プロバイダー
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// カスタムフック
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

// 便利なアクションヘルパー
export function useAppActions() {
  const { dispatch } = useAppContext()

  return {
    setCredentials: (credentials: XApiCredentials) =>
      dispatch({ type: "SET_CREDENTIALS", payload: credentials }),
    clearCredentials: () => dispatch({ type: "CLEAR_CREDENTIALS" }),
    setAuthenticated: (value: boolean) =>
      dispatch({ type: "SET_AUTHENTICATED", payload: value }),
    setCurrentUser: (user: XUser | null) =>
      dispatch({ type: "SET_CURRENT_USER", payload: user }),
    setFollowing: (users: XUser[]) =>
      dispatch({ type: "SET_FOLLOWING", payload: users }),
    setFollowers: (users: XUser[]) =>
      dispatch({ type: "SET_FOLLOWERS", payload: users }),
    setOneWayFollowing: (users: XUser[]) =>
      dispatch({ type: "SET_ONE_WAY_FOLLOWING", payload: users }),
    setSearchResults: (users: XUser[]) =>
      dispatch({ type: "SET_SEARCH_RESULTS", payload: users }),
    setTweetSearchResults: (tweets: XTweet[]) =>
      dispatch({ type: "SET_TWEET_SEARCH_RESULTS", payload: tweets }),
    addQuoteRetweet: (qr: QuoteRetweet) =>
      dispatch({ type: "ADD_QUOTE_RETWEET", payload: qr }),
    removeQuoteRetweet: (id: string) =>
      dispatch({ type: "REMOVE_QUOTE_RETWEET", payload: id }),
    setLoading: (key: keyof AppState["loading"], value: boolean) =>
      dispatch({ type: "SET_LOADING", payload: { key, value } }),
    setError: (error: string | null) =>
      dispatch({ type: "SET_ERROR", payload: error }),
    removeFromFollowing: (id: string) =>
      dispatch({ type: "REMOVE_FROM_FOLLOWING", payload: id }),
    addToFollowing: (user: XUser) =>
      dispatch({ type: "ADD_TO_FOLLOWING", payload: user }),
  }
}

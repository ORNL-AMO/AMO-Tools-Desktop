import type { Action, ThunkAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import diagramReducer from './diagramReducer'

export const store = configureStore({
  reducer: {
    diagram: diagramReducer,
  }
})

// Infer the type of `store`
export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch']

// * memoize selectors only if deriving results (returning new references, i.e. .map())
// * may also use globalized selectors
export const selectIsDrawerOpen = (state: RootState) => state.diagram.isDrawerOpen;

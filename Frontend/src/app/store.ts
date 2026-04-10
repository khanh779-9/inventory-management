import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import inventoryReducer from '../features/inventory/store/inventorySlice'
import authReducer from '../features/auth/store/authSlice'

/** Trạng thái ứng dụng dùng chung: điều hướng + toast (không gắn với nghiệp vụ cụ thể) */
interface UiState {
  currentPage: string
  search: string
  toast: { kind: 'success' | 'error' | 'info'; message: string } | null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { currentPage: 'dashboard', search: '', toast: null } as UiState,
  reducers: {
    setCurrentPage(state, action: PayloadAction<string>) { state.currentPage = action.payload },
    setSearch(state, action: PayloadAction<string>) { state.search = action.payload },
    showToast(state, action: PayloadAction<UiState['toast']>) { state.toast = action.payload },
    dismissToast(state) { state.toast = null },
  },
})

export const { setCurrentPage, setSearch, showToast, dismissToast } = uiSlice.actions

export const store = configureStore({
  reducer: { ui: uiSlice.reducer, inventory: inventoryReducer, auth: authReducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

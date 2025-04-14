import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import appReducer from '@/store/slices/appSlice';
import authReducer from '@/features/auth/store/authSlice';
import surveyReducer from '@/store/slices/surveySlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    survey: surveyReducer
  },
  middleware: getDefaultMiddleware =>
      getDefaultMiddleware()
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

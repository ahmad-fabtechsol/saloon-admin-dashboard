import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { Toaster } from "sonner"
import { store, persistor } from "@/store/store"

import "./index.css"
import App from "./App.jsx"
import { ThemeProvider } from "@/components/theme-provider.jsx"
import { ErrorModalProvider } from "@/context/ErrorModalProvider"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <ErrorModalProvider>
            <App />
          </ErrorModalProvider>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)

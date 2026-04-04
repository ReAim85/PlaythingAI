// import { Provider } from "@/components/ui/provider"
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <ChakraProvider>
    <App />
    </ChakraProvider>,
)

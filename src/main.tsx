//@ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme , ThemePanel} from '@radix-ui/themes';
import { AuthProvider } from "./utils/BasicContext";
import { AppProvider } from "./utils/AppContext";

import '@radix-ui/themes/styles.css';
import "./index.css"

import App from "./App";
// import "./index.css";

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js').then(
//       (registration) => {
//         console.log('SW registered: ', registration);
//       },
//       (registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       }
//     );
//   });
// }



ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider project_id="f34c0904-c1b6-438d-bdc1-1c2b91cd17d7" >
    <AppProvider>
      <Theme 
          appearance="dark"
          accentColor="purple"
        >
        <App />
        {/* <ThemePanel /> */}
      </Theme>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);

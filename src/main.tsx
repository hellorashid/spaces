//@ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme , ThemePanel} from '@radix-ui/themes';

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
    {/* <AuthProvider > */}
    <Theme 
      appearance="dark"
      accentColor="purple"
      // grayColor="gray"
      // panelBackground="translucent"
    >
      <App />
      {/* <ThemePanel /> */}
    </Theme>
    {/* </AuthProvider> */}
  </React.StrictMode>
);

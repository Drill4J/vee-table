/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const plugin = require("tailwindcss/plugin");


module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        white: 'rgb(204, 204, 204)',
        shade1: `rgb(60, 60, 60)`,
        shade2: `rgb(45, 45, 45)`,
        shade3: `rgb(30, 30, 30)`,

        green: `rgb(106, 138, 85)`,

        blue1: `rgb(59 75 86)`,
        blue2: `rgb(61 100 126)`,
        blue3: `rgb(14 99 156)`,

        yellow: 'rgb(226,180,128)',
      },
    }
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const newUtilities = {
        ".link": {
          backgroundColor: "transparent",
          color: "#007fff",
          cursor: "pointer",
        },
        ".link:hover": {
          color: "#3399ff",
        },
        ".link:active": {
          color: "#006cd8",
        },
        ".action-icon": {
          color: "#e3e6e8",
          cursor: "pointer",
        },
        ".action-icon:hover": {
          color: "#f8f9fb",
        },
        ".action-icon:active": {
          color: "#a4acb3",
        },
      };

      addUtilities(newUtilities);
    }),
  ],
}

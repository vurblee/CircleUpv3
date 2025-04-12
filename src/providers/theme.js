// theme.js
export const defaultTheme = {
  mode: "original", // or whatever you call your original theme
  background: "#ffffff", // always white
  primary: "#0A58CA", // your blue color
  text: "#333333",
  // ... any other properties you need
};

export const lightTheme = {
  mode: "lighter",
  background: "#ffffff", // background remains white
  primary: "#4A90E2", // a lighter blue variant
  text: "#333333",
  // ... any other properties
};

export const darkTheme = {
  mode: "dark",
  background: "#333333", // example dark background (if you ever need it)
  primary: "#0A58CA",
  text: "#ffffff",
  // ... any other properties
};

// New Black and White Theme
export const blackAndWhiteTheme = {
  mode: "blackAndWhite",
  background: "#000000",  // black background
  primary: "#ffffff",     // white primary color
  text: "#ffffff",        // white text
  // ... any other properties if needed
};

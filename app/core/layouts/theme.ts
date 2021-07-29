import { extendTheme } from "@chakra-ui/react"

export const customTheme = extendTheme({
  colors: {
    mainColor: "#202326",
    brandColor: "#43C9BA",
    lightColor: "#FCFCFC",
    borderBtn: "#D9D9D9",
    borderLight: "#F0F0F0",
    textPrimary: "rgba(0, 0, 0, 0.85)",
    text45: "rgba(0, 0, 0, 0.45)",
    brand: {
      100: "#f7fafc",
      // ...
      900: "#1a202c",
    },
    primary: {
      500: "#43C9BA",
    },
  },
  fonts: {
    body: "Roboto",
  },
  variants: {
    brandColor: "#43C9BA",
  },
  styles: {
    global: {
      button: {
        outline: "none",
        "&:foucs, &:hover": {
          outline: "none",
        },
      },
      ".highcharts-credits": {
        display: "none !important",
      },
    },
  },
})

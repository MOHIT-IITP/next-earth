import localFont from "next/font/local";

export const instrumentSans = localFont({
  src: "../assets/fonts/InstrumentSans.ttf",
  variable: "--font-sans",
  display: "swap",
});

export const instrumentSerif = localFont({
  src: [
    {
      path: "../assets/fonts/InstrumentSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/InstrumentSerif-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

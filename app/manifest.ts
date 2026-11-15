import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eye Clinic OPD",
    short_name: "OPD",
    description: "Ophthalmic clinic management — works offline at the counter.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#141A17",
    theme_color: "#2D5A27",
    icons: [{ src: "/OpthalmOK-mark.png", sizes: "any", type: "image/png", purpose: "any" }],
  };
}

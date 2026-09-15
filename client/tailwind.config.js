/** @type {import('tailwindcss').Config} */
// Tailwind CSS configuration file
export default {
    // Files Tailwind scans to detect which utility classes are actually used,
    // so only those classes get included in the final CSS build (tree-shaking)
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        // Used to add to or override Tailwind's default theme (colors, spacing, fonts, etc.)
        // Currently empty — no custom theme values defined, using Tailwind's defaults
        extend: {},
    },
    // Additional Tailwind plugins (e.g. forms, typography) — none installed currently
    plugins: [],
}

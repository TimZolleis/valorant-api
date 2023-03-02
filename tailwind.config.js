/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'valorant-red': '#FF4654',
                'valorant-blue': '#0F1923',
                mud: '#111111',
                root: '#05050A',
                accent: '#111',
            },
            fontFamily: {
                'work-sans': ['Work Sans', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
            },
            fontSize: {
                'display-large': '64px',
                'display-medium': '48px',
                'display-small': '40px',
                'headline-large': '32px',
                'headline-medium': '28px',
                'headline-small': '24px',
                'title-large': '22px',
                'title-medium': '20px',
                'title-small': '18px',
                'label-large': '16px',
                'label-medium': '14px',
                'label-small': '12px',
                'body-large': '16px',
                'body-medium': '14px',
                'body small': '12px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--gradient-color-stops))',
            },
        },
    },
    safelist: [
        'bg-red-800/20',
        'bg-red-800',
        'bg-green-800/20',
        'bg-green-800',
        'bg-indigo-800/20',
        'bg-indigo-800',
        'bg-rose-800/20',
        'bg-rose-800',
        'bg-fuchsia-800/20',
        'bg-fuchsia-800',
    ],
    plugins: [],
};

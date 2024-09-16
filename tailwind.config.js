module.exports = {
  mode: 'jit',
  content: ["./templates/**/*.{html,htm}", "./static/**/*.js"],
  safelist: [],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'primary': '#73F190',
        'secondary': '#DBFFE2',
        'tertiary': '#424242',
        'accent': '#3B974E',
        'background': '#1E1E22',
        'muted': '#BBBBBB',
      },
      fontFamily: {
        jost: ['Jost', 'system-ui'],
      },
      backgroundImage: {
        'gradient': 'linear-gradient(to right, #73F190, #3B974E)',
      },
    },
  },
  plugins: [],
}

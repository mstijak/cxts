module.exports = function (production) {
  let config = {
    cacheDirectory: true,
    cacheIdentifier: "v15",
    plugins: [
      // ["transform-runtime", {
      //    helpers: true,
      //    polyfill: false,
      //    regenerator: false
      // }]
    ],
    presets: [
      "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          targets: { chrome: 100 },
        },
      ],
      //    [
      //       "cx-env",
      //       {
      //          targets: {
      //             chrome: 90,
      //             // ie: 11,
      //             // firefox: 30,
      //             // edge: 12,
      //             // safari: 9,
      //          },
      //          modules: false,
      //          loose: true,
      //          useBuiltIns: false,
      //          cx: {
      //             imports: {
      //                useSrc: true,
      //             },
      //          },
      //       },
      //    ],
    ],
    plugins: [
      ["babel-plugin-transform-cx-jsx", { autoImportHtmlElement: false }],
      ["@babel/transform-react-jsx", { pragma: "VDOM.createElement" }],
      // ["@babel/plugin-proposal-private-methods", { loose: false }],
      // ["@babel/plugin-proposal-private-property-in-object", { loose: false }],
    ],
  };

  // if (production)
  //    config.presets.push(['babili', {
  //       mangle: false
  //    }]);

  return config;
};

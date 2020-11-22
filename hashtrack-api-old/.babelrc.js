module.exports = function (api) {
  const config = {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": "current"
          }
        }
      ]
    ],
    "plugins": [
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-class-properties",
      [
        "@babel/plugin-transform-runtime",
        {
          "regenerator": true
        }
      ],
      [
        "module-resolver",
        {
          "root": [
            "./src"
          ],
          "alias": {
            "@api": "./src/api/index.js",
            "@config": "./src/config/index.js",
            "@models": "./src/models",
            "@services": "./src/services",
            "@routes": "./src/api/routes",
            "@loaders": "./src/loaders",
            "@factories": "./src/tests/factories/",
            "@prisma": "./src/prisma/generated/prisma-client/",
            "@controllers": "./src/controllers/",
            "@tests": "./src/tests/",
          }
        }
      ]
    ]
  }

  if (!api.env(["development", "test"])) {
    config.plugins.push("transform-remove-console")
  }
  return config
}
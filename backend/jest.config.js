/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/utils/contextBuilder.ts",
    "src/utils/textChunker.ts",
    "src/services/chat.service.ts",
    "src/services/embedding.service.ts",
    "src/services/document.service.ts",
    "src/controllers/document.controller.ts",
    "src/middlewares/errorHandler.ts",
  ],
  coverageThreshold: {
    global: { lines: 40 },
  },
  moduleNameMapper: {
    "^../config/env$": "<rootDir>/src/__tests__/__mocks__/env.ts",
  },
};

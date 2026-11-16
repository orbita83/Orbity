/* global jest */
// O Jest não tem o runtime nativo de worklets: usa os mocks oficiais do Reanimated e do Worklets.
jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

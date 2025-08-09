/// <reference types="jest" />

export {}; // Make this a module

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeArray(): R;
      toBeString(): R;
    }
  }
}

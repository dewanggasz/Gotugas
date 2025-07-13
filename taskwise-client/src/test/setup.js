import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Menambahkan jest-dom matchers ke expect dari vitest
expect.extend(matchers);

// Menjalankan cleanup (unmount komponen) setelah setiap tes
afterEach(() => {
  cleanup();
});
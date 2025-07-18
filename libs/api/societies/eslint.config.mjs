import { FlatCompat } from '@eslint/eslintrc';
import baseConfigFn from '../../../eslint.config.mjs';

const baseConfig = baseConfigFn(import.meta.url);
export default [...baseConfig];

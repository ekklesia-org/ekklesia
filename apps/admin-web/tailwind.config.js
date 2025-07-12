const sharedConfig = require('../../tailwind.config.shared.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  // TODO: Find another solution for dynamic classes or Find a better way to share the safelist across all apps
  // This is a temporary solution to avoid issues with dynamic classes in Tailwind CSS
  safelist: [
    // AppCard component - rounded variants
    'rounded-none',
    'rounded-sm',
    'rounded-md',
    'rounded-lg',
    'rounded-xl',
    // AppCard component - padding variants
    'p-4',
    'p-6',
    'p-8',
    // AppCard component - border/shadow variants
    'border',
    'border-2',
    'border-gray-200',
    'border-gray-300',
    'border-gray-100',
    'shadow-lg',

    // AppButton component - size classes
    'px-3',
    'py-2',
    'px-4',
    'py-3',
    'px-6',
    'py-4',
    'text-base',
    // AppButton component - variant classes
    'bg-gray-900',
    'text-white',
    'hover:bg-gray-800',
    'focus:ring-gray-700',
    'bg-gray-100',
    'text-gray-900',
    'hover:bg-gray-200',
    'focus:ring-gray-500',
    'bg-red-600',
    'hover:bg-red-700',
    'focus:ring-red-500',
    'bg-green-600',
    'hover:bg-green-700',
    'focus:ring-green-500',
    'bg-transparent',
    'text-gray-700',
    'hover:bg-gray-50',
    'border-gray-300',

    // AppInput component - size classes
    'text-lg',
    // AppInput component - error states
    'border-red-300',
    'focus:ring-red-500',
    'bg-red-50',
    'border-gray-200',

    // AppAlert component - variant classes
    'bg-green-50',
    'border-green-400',
    'bg-red-50',
    'border-red-400',
    'bg-yellow-50',
    'border-yellow-400',
    'bg-blue-50',
    'border-blue-400',
    // AppAlert component - text colors
    'text-green-800',
    'text-red-800',
    'text-yellow-800',
    'text-blue-800',
    'text-green-700',
    'text-red-700',
    'text-yellow-700',
    'text-blue-700',
    // AppAlert component - close button colors
    'text-green-400',
    'hover:text-green-600',
    'text-red-400',
    'hover:text-red-600',
    'text-yellow-400',
    'hover:text-yellow-600',
    'text-blue-400',
    'hover:text-blue-600',

    // AppStatsCard component - icon colors
    'h-8',
    'w-8',
    'text-blue-600',
    'text-green-600',
    'text-yellow-600',
    'text-purple-600',
    'text-red-600',
    'text-gray-600',
    // AppStatsCard component - trend classes
    'h-4',
    'w-4',
    'text-green-600',
    'text-red-600',
    'text-gray-600',

    // AppToast component - position classes
    'right-4',
    'left-4',
    'left-1/2',
    'transform',
    '-translate-x-1/2',
    // AppToast component - type classes
    'bg-green-50/90',
    'text-green-800',
    'border-green-200/50',
    'bg-red-50/90',
    'text-red-800',
    'border-red-200/50',
    'bg-yellow-50/90',
    'text-yellow-800',
    'border-yellow-200/50',
    'bg-blue-50/90',
    'text-blue-800',
    'border-blue-200/50',
    // AppToast component - countdown bar classes
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-blue-500',
    // AppToast component - other classes
    'h-5',
    'w-5',
    'mt-1',
    'hover:scale-110',
    'animate-bounce-in',
    'animate-slide-in',
  ],
  ...sharedConfig,
};

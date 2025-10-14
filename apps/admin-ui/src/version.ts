export const BUILD = {
  commit: import.meta.env.VITE_GIT_COMMIT || 'dev',
  builtAt: import.meta.env.VITE_BUILD_TIME || new Date().toISOString()
};

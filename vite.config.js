import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // three.js + the GLTF loader are genuinely large; keep the warning useful
    // without it firing on the expected, lazily-loaded 3D chunks.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // three.js is already code-split automatically via the lazy 3D viewer
          // imports, so we leave it alone. We only pull firebase — which is
          // always loaded — into its own long-lived cache chunk. Splitting a
          // lazily-loaded library here would inadvertently turn it into an
          // eager modulepreload, so we deliberately keep the rule minimal.
          if (id.includes('/firebase/') || id.includes('@firebase')) return 'firebase';
          return undefined;
        },
      },
    },
  },
});

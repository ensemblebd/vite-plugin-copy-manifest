import * as path from 'path';
import * as fs from 'fs';

export default function copyManifest(options = {}) {
  const defaultManifestPath = ".vite";
  return {
    name: 'vite-plugin-copy-manifest',
    configResolved(resolvedConfig) {
      let manifestPath = options.manifestPath ? options.manifestPath : defaultManifestPath;
      
      const outDir = resolvedConfig.build.outDir;
      const manifestFilename = typeof resolvedConfig.build.manifest === 'string' ? resolvedConfig.build.manifest : 'manifest.json';

      resolvedConfig.plugins.forEach(plugin => {
        if (plugin.name != 'vite-plugin-copy-manifest') {
          return;
        }
        plugin.writeBundle = () => {
          const src = path.resolve(outDir, manifestPath, manifestFilename);
          const dest = path.resolve(options.destDir, manifestFilename);

          fs.copyFileSync(src, dest);
        }
      });
    },
  };
}

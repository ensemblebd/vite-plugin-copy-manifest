import * as path from 'path';
import * as fs from 'fs';

export default function copyManifest(options = {}) {
  return {
    name: 'vite-plugin-copy-manifest',
    configResolved(resolvedConfig) {
      const outDir = resolvedConfig.build.outDir;
      const manifestFilename = typeof resolvedConfig.build.manifest === 'string' ? resolvedConfig.build.manifest : 'manifest.json';

      resolvedConfig.plugins.forEach(plugin => {
        if (plugin.name != 'vite-plugin-copy-manifest') {
          return;
        }
        plugin.writeBundle = () => {
          const src = path.resolve(outDir + manifestFilename);
          const dest = path.resolve(options.destDir + manifestFilename);

          fs.copyFileSync(src, dest);
        }
      });
    },
  };
}
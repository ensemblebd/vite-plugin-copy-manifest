import path from "node:path";
import fs from "node:fs/promises";

/**
 * @param {object} options.manifestPath - The path to the manifest file produced by Vite (relative, default: ".vite" inside your outDir). Plugin reads the filename from the Vite config.
 * @param {object} options.destDir - The directory to copy the manifest file to (relative path to __dirname, default: outDir of vite config, if not specified).
 * @param {object} options.destFile - The filename to copy the manifest file to (no path, default: Vite config's manifest filename (ie "manifest.json")).
 * If your config uses the old destFile relative path from previous version of this plugin, it is automatically split across both options.destDir and options.destFile (for example, destFile: "./dist/manifest.json" becomes:  {destFile: "manifest.json", destDir: "./dist"} ).
 * @param {object} options.moveMode - If true, the plugin will move the manifest file instead of copying it. (Default is false).
 * @param {object} options.debug - If true, the plugin will output debug information to the console. (Default is false).
 * @returns {import('vite').Plugin}
 */
const CopyManifestPlugin = async (options = {}) => {
  let outDir, manifestPath, manifestFilename, config;
  const defaultManifestPath = ".vite";

  return {
    name: 'vite-plugin-copy-manifest',

    configResolved(resolvedConfig) {
		config = resolvedConfig;
      manifestPath = options.manifestPath ? options.manifestPath : defaultManifestPath;
      
      outDir = resolvedConfig.build.outDir;
      manifestFilename = typeof resolvedConfig.build.manifest === 'string' ? resolvedConfig.build.manifest : 'manifest.json';

		// backwards compat for existing users of this plugin:
		if (!options.destFile && options.destDir && options.destDir.contains('/')) {
			options.destFile = options.destDir.substring(options.destDir.lastIndexOf('/')+1);
			options.destDir = options.destDir.substring(0, options.destDir.lastIndexOf('/'));

			if (options.debug) config.logger.info(`\r\nManifest file destination split across destDir and destFile. Please use new parameters ( {destDir: "${options.destDir}", destFile: "${options.destFile}"} ).`);
		}
    },

	 async closeBundle(_options, _bundle) {
      if (manifestFilename === false) return;

		const src = path.resolve(outDir, manifestPath, manifestFilename);
		const dest = path.resolve(options.destDir || outDir, options.destFile || manifestFilename);
		
		if (options.debug) config.logger.info("\r\nCopying manifest file from " + src + " to " + dest);

		let exists = false;
		try {
			await fs.access(src);
			exists=true;
		} catch (e) {
			config.logger.warn("\r\n[plugin-copy-manifest] Manifest file not found at " + src);
		}

		if (exists) {
			if (!options.moveMode) {
				await fs.copyFile(src, dest);
			}
			else {
				await fs.rename(src, dest);
			}
			
			if (options.debug) config.logger.info(`\r\nManifest file moved.`);
		}
    },
  };
}

export default CopyManifestPlugin;

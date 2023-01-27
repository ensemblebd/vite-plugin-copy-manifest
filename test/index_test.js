import copyManifest from '../src/index.js';
import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

describe('copyManifest', function () {
  it('it should do nothing if plugin with name `vite-plugin-copy-manifest` not exists', function () {
    let copyManifestPlugin = copyManifest({ destDir: './data ' });

    let resolvedConfig = {
      build: {
        outDir: "./dist"
      },
      plugins: [],
    };
    const resolvedConfigClone = resolvedConfig;

    copyManifestPlugin.configResolved(resolvedConfig);
    assert.deepEqual(resolvedConfig, resolvedConfigClone);
  });

  it('it should assign function to `writeBundle` hook if the plugin exists', function () {
    let copyManifestPlugin = copyManifest({ destDir: './data ' });

    let resolvedConfig = {
      build: {
        outDir: "./dist"
      },
      plugins: [
        {
          name: 'vite-plugin-copy-manifest',
        }
      ],
    };
    copyManifestPlugin.configResolved(resolvedConfig);

    let plugin = null;
    resolvedConfig.plugins.forEach(item => {
      if (item.name != 'vite-plugin-copy-manifest') {
        return;
      }
      plugin = item;
    });

    assert.notEqual(plugin, null);
    assert.equal(typeof plugin.writeBundle === 'function', true);
  });

  it('the function should correctly copy the file', function () {
    const dir = path.join(os.tmpdir(), 'copyManifest_' + uuidv4());
    const distDir = path.join(dir, 'dist/');
    const dataDir = path.join(dir, 'data/');
    fs.mkdirSync(dir);
    fs.mkdirSync(distDir);
    fs.mkdirSync(dataDir);

    let copyManifestPlugin = copyManifest({ destDir: dataDir });
    let resolvedConfig = {
      build: {
        manifest: 'assets.json',
        outDir: distDir,
      },
      plugins: [copyManifestPlugin],
    };

    // prepare src assets.json
    fs.writeFileSync(path.join(distDir, 'assets.json'), 'hello');

    // run plugin
    copyManifestPlugin.configResolved(resolvedConfig);
    copyManifestPlugin.writeBundle();

    // check if assets.json is copied to dest
    assert.equal(fs.readFileSync(path.join(dataDir, 'assets.json')), 'hello');
  });
});
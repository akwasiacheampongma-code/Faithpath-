# Installed-source reachability excerpts

Read-only excerpts from the installed dependencies on 2026-11-08.

## `node_modules/expo/node_modules/@expo/cli/build/src/utils/glob.js`

```text
23: function _glob() {
24:     const data = require("glob");
25:     _glob = function() {
26:         return data;
27:     };
28:     return data;
29: }
30: const everyMatchAsync = _glob().glob;
31: function anyMatchAsync(pattern, options) {
32:     return new Promise((resolve, reject)=>{
33:         const controller = new AbortController();
34:         (0, _glob().globStream)(pattern, {
35:             ...options,
36:             signal: controller.signal
37:         }).on('error', (error)=>{
38:             if (!controller.signal.aborted) {
39:                 reject(error);
40:             }
41:         }).once('end', ()=>resolve([])).once('data', (file)=>{
42:             controller.abort();
43:             resolve([
44:                 file
45:             ]);
46:         });
47:     });
```

## `node_modules/expo/node_modules/@expo/cli/build/src/start/doctor/typescript/TypeScriptProjectPrerequisite.js`

```text
122:     /** Exposed for testing. */ async _getSetupRequirements() {
123:         const tsConfigPath = await this._hasTSConfig();
124:         // Enable TS setup if the project has a `tsconfig.json`
125:         if (tsConfigPath) {
126:             const content = await _promises().default.readFile(tsConfigPath, {
127:                 encoding: 'utf8'
128:             }).then((txt)=>txt.trim(), // null when the file doesn't exist.
129:             ()=>null);
130:             const isBlankConfig = content === '' || content === '{}';
131:             return {
132:                 isBootstrapping: isBlankConfig
133:             };
134:         }
135:         // This is a somewhat heavy check in larger projects.
136:         // Test that this is reasonably paced by running expo start in `expo/apps/native-component-list`
137:         const typescriptFile = await this._queryFirstTypeScriptFileAsync();
138:         if (typescriptFile) {
139:             return {
140:                 isBootstrapping: true
141:             };
142:         }
143:         return null;
```
```text
174:     /** Return the first TypeScript file in the project. */ async _queryFirstTypeScriptFileAsync() {
175:         try {
176:             // TODO(Bacon): Use `everyMatch` since a bug causes `anyMatch` to return inaccurate results when used multiple times.
177:             const results = await (0, _glob.everyMatchAsync)('**/*.@(ts|tsx)', {
178:                 cwd: this.projectRoot,
179:                 signal: AbortSignal.timeout(5000),
180:                 ignore: [
181:                     '**/@(Carthage|Pods|node_modules)/**',
182:                     '**/*.d.ts',
183:                     '@(ios|android|web|web-build|dist)/**'
184:                 ]
185:             });
186:             return results[0] ?? null;
187:         } catch (error) {
188:             if (error.name === 'TimeoutError') {
189:                 return null;
190:             }
191:             throw error;
192:         }
```

## `node_modules/expo/node_modules/@expo/cli/build/src/start/server/metro/router.js`

```text
161: function isApiRoutesEnabled(exp) {
162:     const apiRoutes = exp.extra?.router?.apiRoutes;
163:     if (apiRoutes != null) {
164:         return apiRoutes === true;
165:     }
166:     return exp.web?.output === 'server' || !!exp.experiments?.reactServerComponentRoutes || !!exp.experiments?.reactServerFunctions;
167: }
168: function isApiRouteConvention(name) {
169:     return /\+api\.[tj]sx?$/.test(name);
170: }
171: function getApiRoutesForDirectory(cwd) {
172:     return (0, _glob().sync)('**/*+api.@(ts|tsx|js|jsx)', {
173:         cwd,
174:         absolute: true,
175:         dot: true
176:     });
177: }
178: function getMiddlewareForDirectory(cwd, mode) {
179:     const files = (0, _glob().sync)('+middleware.@(ts|tsx|js|jsx)', {
180:         cwd,
181:         absolute: true,
182:         dot: true
183:     });
184:     if (files.length === 0) return null;
185:     if (files.length > 1) {
186:         // In development, throw an error if there are multiple root-level middleware files
187:         if (mode === 'development') {
188:             const relativePaths = files.map((f)=>'./' + _path().default.relative(cwd, f)).sort();
189:             throw new Error(`Only one middleware file is allowed. Keep one of the conflicting files: ${relativePaths.map((p)=>`"${p}"`).join(' or ')}`);
190:         }
191:     }
192:     return files[0];
193: }
194: function getRoutePaths(cwd) {
195:     return (0, _glob().sync)('**/*.@(ts|tsx|js|jsx)', {
196:         cwd,
197:         dot: true
198:     }).map((p)=>'./' + normalizePaths(p));
```

## `node_modules/@expo/fingerprint/build/Options.js`

```text
149: async function collectIgnorePathsAsync(projectRoot, pathsFromConfig, options) {
150:     const ignorePaths = [
151:         ...DEFAULT_IGNORE_PATHS,
152:         ...pathsFromConfig ?? [],
153:         ...options?.ignorePaths ?? [],
154:         ...options?.dirExcludes?.map((dirExclude)=>`${dirExclude}/**/*`) ?? []
155:     ];
156:     const fingerprintIgnorePath = _path().default.join(projectRoot, FINGERPRINT_IGNORE_FILENAME);
157:     try {
158:         const fingerprintIgnore = await _promises().default.readFile(fingerprintIgnorePath, 'utf8');
159:         const fingerprintIgnoreLines = fingerprintIgnore.split('\n');
160:         for (const line of fingerprintIgnoreLines){
161:             const trimmedLine = line.trim();
162:             if (trimmedLine) {
163:                 ignorePaths.push(trimmedLine);
164:             }
165:         }
166:     } catch  {}
167:     return (0, _Path.buildPathMatchObjects)(ignorePaths);
```

## `node_modules/@expo/fingerprint/build/utils/Path.js`

```text
84: function isIgnoredPath(filePath, ignorePaths, minimatchOptions = {
85:     dot: true
86: }) {
87:     const matchObjects = buildPathMatchObjects(ignorePaths, minimatchOptions);
88:     return isIgnoredPathWithMatchObjects(filePath, matchObjects);
89: }
90: function buildPathMatchObjects(paths, minimatchOptions = {
91:     dot: true
92: }) {
93:     return paths.map((filePath)=>new (_minimatch()).Minimatch(filePath, minimatchOptions));
94: }
95: function appendIgnorePath(matchObjects, path, minimatchOptions = {
96:     dot: true
97: }) {
98:     matchObjects.push(new (_minimatch()).Minimatch(path, minimatchOptions));
```
```text
128:     return dirIgnorePatterns.map((pattern)=>new (_minimatch()).Minimatch(pattern, minimatchOptions));
129: }
130: function isIgnoredPathWithMatchObjects(filePath, matchObjects) {
131:     let result = false;
132:     for (const minimatchObj of matchObjects){
133:         const stripParentPrefix = minimatchObj.pattern.startsWith('**/');
134:         const normalizedFilePath = normalizeFilePath(filePath, {
135:             stripParentPrefix
136:         });
137:         const currMatch = minimatchObj.match(normalizedFilePath);
138:         if (minimatchObj.negate && result && !currMatch) {
139:             // Special handler for negate (!pattern).
140:             // As long as previous match result is true and not matched from the current negate pattern, we should early return.
141:             return false;
142:         }
143:         if (!minimatchObj.negate) {
144:             result ||= currMatch;
145:         }
```

## `node_modules/@expo/fingerprint/build/ProjectWorkflow.js`

```text
193:     constructor(rootDir){
194:         this.rootDir = rootDir;
195:     }
196:     async initIgnoreAsync() {
197:         const ignoreFilePaths = (await (0, _glob().glob)(`**/${GITIGNORE_FILENAME}`, {
198:             cwd: this.rootDir,
199:             ignore: [
200:                 'node_modules'
201:             ],
202:             follow: false
203:         }))// ensure that parent dir is before child directories
204:         .sort((a, b)=>a.length - b.length && a.localeCompare(b));
205:         const ignoreMapping = await Promise.all(ignoreFilePaths.map(async (filePath)=>{
206:             return [
207:                 filePath.slice(0, filePath.length - GITIGNORE_FILENAME.length),
208:                 (0, _ignore().default)().add(await _promises().default.readFile(_path().default.join(this.rootDir, filePath), 'utf-8'))
```

## `node_modules/expo/node_modules/@expo/cli/build/src/utils/build-cache-providers/index.js`

```text
180: async function calculateFingerprintHashAsync({ projectRoot, platform, provider, runOptions }) {
181:     if (provider.plugin.calculateFingerprintHash) {
182:         return await provider.plugin.calculateFingerprintHash({
183:             projectRoot,
184:             platform,
185:             runOptions
186:         }, provider.options);
187:     }
188:     const Fingerprint = importFingerprintForDev(projectRoot);
189:     if (!Fingerprint) {
190:         _log.warn('@expo/fingerprint is not installed in the project, skipping build cache.');
191:         return null;
192:     }
193:     const fingerprint = await Fingerprint.createFingerprintAsync(projectRoot);
194:     return fingerprint.hash;
```

## Application and export facts

- `app.json`: `web.output` is `single`; no server output or RSC/RSC-functions experiment is enabled.
- `package.json` build: Expo web export, then local PWA and offline scripts.
- `scripts/serve.mjs`: Node built-in `http`, `fs/promises`, `path`, `zlib`; does not import Expo CLI, fingerprint, glob or minimatch.
- A `tsconfig.json` is present, so `_getSetupRequirements()` returns before its timed TypeScript file-discovery fallback.
- The installed `anyMatchAsync()` helper is only declared/exported, without a call site in the installed Expo CLI JS search.

## minimatch optimization precondition

- Installed glob13 `dist/commonjs/glob.js:154` explicitly sets `optimizationLevel: 2` when constructing Minimatch. Its use of malicious **/../ patterns could therefore reach this advisory. Observed Expo route and TypeScript discovery patterns are constants, with no untrusted app input routed to them.
- Fingerprint’s direct `new Minimatch(pattern, {dot:true})` passes no optimization level; installed minimatch10 `index.js:341` defaults to 1. That direct ignore-pattern path does not meet this specific advisory’s >=2 precondition. It remains a flagged installed package.

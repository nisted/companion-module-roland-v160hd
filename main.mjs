// Companion entry point (base 2.x wants a default export).
// The module itself is CommonJS in index.js and src/.
import mod from './index.js'

export const UpgradeScripts = mod.UpgradeScripts
export default mod.v160Instance

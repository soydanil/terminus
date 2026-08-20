// Detección de SO/arquitectura y mapeo a la clave de plataforma del updater
// de Tauri (la misma que usa latest.json: "windows-x86_64", "darwin-aarch64",
// ...). Hoy la release publica esas dos; el día que haya Linux basta con que
// aparezca su clave en el manifiesto — este archivo ya la resuelve.
//
// Un Mac Intel resuelve `darwin-x86_64`, que la release NO publica, y sale por
// el camino de «todavía no hay build para tu plataforma». Es correcto: lo que
// se construye es arm64, y darle un binario que no puede ejecutar sería peor
// que decírselo.

const LABELS = {
  win32: 'Windows',
  darwin: 'macOS',
  linux: 'Linux',
};

const ARCH_LABELS = {
  x64: 'x64',
  arm64: 'ARM64 (Apple Silicon)',
  ia32: 'x86 32-bit',
};

// process.platform x process.arch -> clave de plataforma de Tauri updater.
function tauriPlatformKey(platform, arch) {
  const archKey = arch === 'x64' ? 'x86_64' : arch === 'arm64' ? 'aarch64' : null;
  if (!archKey) return null;
  switch (platform) {
    case 'win32':
      return `windows-${archKey}`;
    case 'darwin':
      return `darwin-${archKey}`;
    case 'linux':
      return `linux-${archKey}`;
    default:
      return null;
  }
}

export function detectPlatform() {
  const platform = process.platform;
  const arch = process.arch;
  const label = `${LABELS[platform] || platform} ${ARCH_LABELS[arch] || arch}`;
  return {
    platform,
    arch,
    label,
    key: tauriPlatformKey(platform, arch),
    // Qué hay que hacer con lo que se baja, que no es lo mismo en las dos:
    // Windows recibe un instalador que se ejecuta, y macOS el `.app`
    // comprimido, que se descomprime y se copia. Linux existe para dar el
    // mensaje correcto mientras no haya build.
    installerKind:
      platform === 'win32' ? 'windows-nsis' : platform === 'darwin' ? 'macos' : platform === 'linux' ? 'linux' : 'unknown',
  };
}

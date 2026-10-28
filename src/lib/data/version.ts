// The app's version tracks the Ghostty release it targets rather than counting its own releases:
// the settings registry is audited against `ghostty +show-config --default` for exactly this
// version, so "1.4.0" answers "which Ghostty does this config apply to?" directly. Bump this (and
// `version` in package.json, which must stay equal) when the registry is re-audited upstream.
export const GHOSTTY_VERSION = "1.4.0";

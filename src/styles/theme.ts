export const colors = {
  bg: {
    editor: "var(--color-bg-editor)",
    sidebar: "var(--color-bg-sidebar)",
    toolbar: "var(--color-bg-toolbar)",
    panel: "var(--color-bg-panel)",
  },
  surface: {
    tabActive: "var(--color-surface-tab-active)",
    tabInactive: "var(--color-surface-tab-inactive)",
    activeFile: "var(--color-surface-active-file)",
  },
  border: "var(--color-border)",
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    muted: "var(--color-text-muted)",
  },
  accent: "var(--color-accent)",
  git: {
    modified: "var(--color-git-modified)",
    added: "var(--color-git-added)",
    untracked: "var(--color-git-untracked)",
  },
  status: {
    clean: "var(--color-status-clean)",
    dirty: "var(--color-status-dirty)",
  },
} as const;

export const fonts = {
  ui: "var(--font-ui)",
  editor: "var(--font-editor)",
  preview: "var(--font-preview)",
} as const;

export const fontSize = {
  xs: "var(--font-size-xs)",
  sm: "var(--font-size-sm)",
  base: "var(--font-size-base)",
  md: "var(--font-size-md)",
  lg: "var(--font-size-lg)",
  xl: "var(--font-size-xl)",
  "2xl": "var(--font-size-2xl)",
} as const;

export const fontWeight = {
  regular: "var(--font-weight-regular)",
  medium: "var(--font-weight-medium)",
  semibold: "var(--font-weight-semibold)",
  bold: "var(--font-weight-bold)",
} as const;

export const lineHeight = {
  tight: "var(--line-height-tight)",
  base: "var(--line-height-base)",
  relaxed: "var(--line-height-relaxed)",
} as const;

export const space = {
  1: "var(--space-1)",
  2: "var(--space-2)",
  3: "var(--space-3)",
  4: "var(--space-4)",
  5: "var(--space-5)",
  6: "var(--space-6)",
  8: "var(--space-8)",
} as const;

export const layout = {
  sidebarWidth: "var(--layout-sidebar-width)",
  toolbarHeight: "var(--layout-toolbar-height)",
  statusbarHeight: "var(--layout-statusbar-height)",
  gutterWidth: "var(--layout-gutter-width)",
} as const;

export const radius = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
} as const;

export const shadow = {
  palette: "var(--shadow-palette)",
} as const;

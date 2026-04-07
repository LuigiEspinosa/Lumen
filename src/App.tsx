import { useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { useVaultStore } from "./stores/vault";
import "./styles/tokens.css";

function App() {
  const { vaultPath, loading, error, openVault, loadLastVault } =
    useVaultStore();

  useEffect(() => {
    loadLastVault();
    // loadLastVault is a stable Zustand action ref; the exhaustive-deps warning
    // here is a false positive - adding it to deps would cause an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenVault = async () => {
    const result = await open({
      directory: true,
      multiple: false,
      title: "Open Vault",
    });
    // result is null when the user dismisses the dialog - do not call openVault
    if (!result) return;
    await openVault(result as string);
  };

  if (loading) {
    return (
      <div className="screen-center">
        <span
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-ui)",
            fontSize: "var(--font-size-md)",
          }}
        >
          Loading vault...
        </span>
      </div>
    );
  }

  if (!vaultPath) {
    return (
      <div
        className="screen-center"
        style={{ flexDirection: "column", gap: "var(--space-4)" }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-ui)",
            fontSize: "var(--font-size-2xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          Lumen
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-ui)",
            fontSize: "var(--font-size-md)",
            color: "var(--color-text-secondary)",
          }}
        >
          Git-native Markdown notes for WSL
        </p>
        {error && (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-ui)",
              fontSize: "var(--font-size-md)",
              color: "var(--color-status-dirty)",
            }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleOpenVault}
          style={{
            padding: "var(--space-2) var(--space-5)",
            background: "var(--color-accent)",
            color: "#ffffff",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-ui)",
            fontSize: "var(--font-size-md)",
            cursor: "pointer",
          }}
        >
          Open Vault
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="sidebar" style={{ width: "var(--layout-sidebar-width)" }}>
        <div
          className="content-area"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "var(--font-size-md)",
              color: "var(--color-text-secondary)",
            }}
          >
            Select a file to begin editing
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;

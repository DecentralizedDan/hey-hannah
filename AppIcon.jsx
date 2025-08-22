export function AppIcon() {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: "1024px",
        height: "1024px",
        backgroundColor: "#FFFF00",
        padding: "0",
        margin: "0",
      }}
    >
      <div
        style={{
          color: "#0000FF",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: "center",
          lineHeight: "1.2",
        }}
      >
        <div
          style={{
            fontSize: "165px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          Hey Hannah
        </div>
        <div
          style={{
            fontSize: "120px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            marginTop: "20px",
          }}
        >
          Made by Dan TS
        </div>
      </div>
    </div>
  );
}

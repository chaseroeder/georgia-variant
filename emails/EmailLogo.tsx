/**
 * The logo monogram for emails, made of styled text instead of an image.
 * Many inboxes block images until you click "show images", but text
 * always shows, so the header looks right on first open.
 */
export function EmailLogo({ initials }: { initials: string }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "separate" }}>
      <tbody>
        <tr>
          <td
            align="center"
            valign="middle"
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#012169",
              border: "1px solid rgba(185,217,235,0.6)",
              borderRadius: 9,
              fontFamily: "Fraunces, Georgia, 'Times New Roman', serif",
              fontSize: initials.length > 1 ? 17 : 21,
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: "40px",
              letterSpacing: "-0.3px",
            }}
          >
            <span style={{ borderBottom: "2px solid #B9D9EB", paddingBottom: 1 }}>{initials}</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

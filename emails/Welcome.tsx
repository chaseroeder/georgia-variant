/**
 * Short "you're subscribed" email sent right after someone signs up.
 */
import { Body, Container, Head, Html, Link, Preview, Section, Text } from "@react-email/components";
import { EmailLogo } from "./EmailLogo";

export interface WelcomeEmailProps {
  siteName: string;
  siteUrl: string;
  initials: string;
  disclaimer: string;
}

const navy = "#012169";
const lightBlue = "#B9D9EB";
const sans = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const serif = "Fraunces, Georgia, 'Times New Roman', serif";

export default function WelcomeEmail({ siteName, siteUrl, initials, disclaimer }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`You're in. ${siteName} arrives before the opening bell every weekday.`}</Preview>
      <Body style={{ backgroundColor: "#EEF5FB", margin: 0, padding: "24px 0", fontFamily: sans }}>
        <Container style={{ maxWidth: 560, backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden" }}>
          <Section style={{ backgroundColor: navy, padding: "24px 28px" }}>
            <EmailLogo initials={initials} />
            <Text style={{ margin: "12px 0 0", fontFamily: serif, fontSize: 24, fontWeight: 600, color: "#ffffff" }}>
              Welcome to {siteName}
            </Text>
          </Section>
          <Section style={{ padding: "24px 28px" }}>
            <Text style={{ fontSize: 16, lineHeight: "24px", color: "#1F2937", margin: 0 }}>
              You&rsquo;re subscribed. Every weekday morning you&rsquo;ll get a five-minute read on markets: what moved and why,
              rates and the Fed, a weekly contrarian stock pick, and Emory alumni doing interesting work in finance.
            </Text>
            <Text style={{ fontSize: 16, lineHeight: "24px", color: "#1F2937", margin: "16px 0 0" }}>
              Can&rsquo;t wait until tomorrow? Today&rsquo;s issue is already on the site.
            </Text>
            <Link
              href={siteUrl}
              style={{ display: "inline-block", marginTop: 20, backgroundColor: navy, color: "#ffffff", fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 999, textDecoration: "none" }}
            >
              Read today&rsquo;s issue
            </Link>
            <Text style={{ fontSize: 12, color: "#5B6472", margin: "28px 0 0", borderTop: `1px solid ${lightBlue}`, paddingTop: 14 }}>
              {disclaimer} If you didn&rsquo;t sign up, you can ignore this email; every issue includes an unsubscribe link.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

import { LegalLayout } from "@/components/legal/LegalLayout";
import { Seo } from "@/components/Seo";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mt-8 mb-3">{children}</h2>
);

const Terms = () => (
  <LegalLayout title="Terms of Service" updated="22 April 2026">
    <Seo
      title="Terms of Service — ConsultYourCA AI"
      description="Terms governing access to and use of ConsultYourCA AI by Indian CAs and CA students."
      path="/terms"
    />
    <p>
      These Terms of Service ("Terms") govern your access to and use of{" "}
      <strong>ConsultYourCA AI</strong> (the "Service"). By creating an account or using the Service,
      you agree to be bound by these Terms. If you do not agree, do not use the Service.
    </p>

    <H2>1. Eligibility</H2>
    <p>
      You must be at least 18 years old and capable of entering into a binding contract under
      Indian law to use the Service.
    </p>

    <H2>2. Account & security</H2>
    <p>
      You are responsible for maintaining the confidentiality of your login credentials and for
      all activity under your account. Notify us immediately at{" "}
      <a className="text-accent underline" href="mailto:security@consultyourca.ai">security@consultyourca.ai</a>{" "}
      of any unauthorised access.
    </p>

    <H2>3. Free trial & subscription plans</H2>
    <ul className="list-disc pl-6 space-y-1">
      <li>New users receive a <strong>7-day free trial</strong> with a limited number of queries.</li>
      <li>After the trial, continued use requires a paid subscription (Student / Professional / Firm tiers).</li>
      <li>Fees are billed in advance, are inclusive of GST where applicable, and are non-refundable except as stated in our Refund Policy.</li>
      <li>We may change pricing with 30 days' notice to existing subscribers.</li>
    </ul>

    <H2>4. Acceptable use</H2>
    <p>You agree NOT to:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Use the Service for any unlawful purpose or in violation of ICAI rules of professional conduct.</li>
      <li>Reverse-engineer, scrape, or build competing products using our output.</li>
      <li>Submit personally identifiable client data that you are not authorised to process.</li>
      <li>Abuse rate limits, share accounts, or create multiple trial accounts.</li>
      <li>Upload malicious code or attempt to breach our security.</li>
    </ul>

    <H2>5. AI output disclaimer — IMPORTANT</H2>
    <p>
      ConsultYourCA AI provides <strong>AI-generated information for reference only</strong>. It is{" "}
      <strong>not legal, tax, or professional advice</strong> and does not create a professional
      relationship. The Service may produce inaccurate, outdated, or incomplete information
      ("hallucinations"). <strong>You must independently verify every answer against the Bare Act,
      official circulars, notifications, and case law before relying on it for any client matter,
      filing, or professional opinion.</strong> You remain fully responsible for all professional
      work you produce.
    </p>

    <H2>6. Not affiliated with ICAI</H2>
    <p>
      ConsultYourCA AI is an independent software product. We are not affiliated with, endorsed by, or
      sponsored by the Institute of Chartered Accountants of India (ICAI), the Income Tax
      Department, GSTN, or any government body.
    </p>

    <H2>7. Intellectual property</H2>
    <p>
      The Service, including software, design, and branding, is owned by ConsultYourCA AI and protected
      by copyright and trademark law. You retain ownership of the queries you submit and the
      outputs you generate; we grant you a worldwide, royalty-free licence to use generated
      outputs for your professional work, subject to Section 5.
    </p>

    <H2>8. Suspension & termination</H2>
    <p>
      We may suspend or terminate your account for breach of these Terms, non-payment, or misuse.
      You may cancel at any time from your dashboard; cancellation stops future renewals but does
      not refund the current billing period (except as stated in our Refund Policy).
    </p>

    <H2>9. Limitation of liability</H2>
    <p>
      To the maximum extent permitted by law, ConsultYourCA AI's total aggregate liability for any
      claim arising out of or relating to the Service shall not exceed the fees paid by you in the
      <strong> 3 months</strong> preceding the event. We are not liable for indirect, incidental,
      consequential, or punitive damages, including lost profits, lost data, or reliance on AI
      output.
    </p>

    <H2>10. Indemnity</H2>
    <p>
      You agree to indemnify and hold ConsultYourCA AI harmless from any claim arising from your misuse
      of the Service, your violation of these Terms, or your violation of third-party rights
      (including your clients').
    </p>

    <H2>11. Governing law & jurisdiction</H2>
    <p>
      These Terms are governed by the laws of India. Any dispute shall be subject to the exclusive
      jurisdiction of the courts of <strong>[Your City], India</strong>.
    </p>

    <H2>12. Changes to Terms</H2>
    <p>
      We may update these Terms. Material changes will be notified by email or in-app. Continued
      use after the effective date constitutes acceptance.
    </p>

    <H2>13. Contact</H2>
    <p>
      Email <a className="text-accent underline" href="mailto:support@consultyourca.ai">support@consultyourca.ai</a> for any questions about these Terms.
    </p>
  </LegalLayout>
);

export default Terms;

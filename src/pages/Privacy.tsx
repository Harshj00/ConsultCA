import { LegalLayout } from "@/components/legal/LegalLayout";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mt-8 mb-3">{children}</h2>
);

const Privacy = () => (
  <LegalLayout title="Privacy Policy" updated="22 April 2026">
    <p>
      This Privacy Policy explains how <strong>ConsultYourCA AI</strong> ("we", "us", "our") collects,
      uses, discloses, and protects your personal data when you use our website and services
      (the "Service"). We are committed to complying with the{" "}
      <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and applicable Indian laws.
    </p>

    <H2>1. Who we are (Data Fiduciary)</H2>
    <p>
      ConsultYourCA AI is the Data Fiduciary for personal data processed through the Service.
      For any privacy-related query, write to <a className="text-accent underline" href="mailto:privacy@consultyourca.ai">privacy@consultyourca.ai</a>.
    </p>

    <H2>2. Data we collect</H2>
    <ul className="list-disc pl-6 space-y-1">
      <li><strong>Account data:</strong> name, email, password (hashed), role (CA student / Practicing CA / CA Firm).</li>
      <li><strong>Usage data:</strong> queries you submit to our AI tools, conversation history, tokens used, timestamps.</li>
      <li><strong>Technical data:</strong> IP address, browser type, device information, cookies.</li>
      <li><strong>Payment data:</strong> handled by our payment processor (e.g., Razorpay). We do not store card numbers.</li>
    </ul>

    <H2>3. Purpose of processing</H2>
    <ul className="list-disc pl-6 space-y-1">
      <li>To provide and operate the AI tax assistant Service.</li>
      <li>To authenticate you and secure your account.</li>
      <li>To process subscriptions, invoices, and GST-compliant billing.</li>
      <li>To improve our models, reliability, and user experience (using anonymised/aggregated data).</li>
      <li>To send service-related communications (verification, receipts, important updates).</li>
      <li>To comply with legal and regulatory obligations.</li>
    </ul>

    <H2>4. Legal basis & consent</H2>
    <p>
      We process your personal data based on your <strong>consent</strong> given at signup, and for
      "certain legitimate uses" permitted under Section 7 of the DPDP Act (e.g., performing a
      contract, compliance with law). You may withdraw consent at any time — see Section 8.
    </p>

    <H2>5. AI processing & third parties</H2>
    <p>
      Your queries may be processed by third-party large language model providers (e.g., Google
      Gemini, OpenAI) solely to generate a response. We do not permit these providers to use your
      data to train their public models. We use Supabase (via Lovable Cloud) for authentication and
      database storage. All providers are bound by data-processing agreements.
    </p>

    <H2>6. Data retention</H2>
    <p>
      We retain your account and conversation data for as long as your account is active, and for a
      reasonable period thereafter to meet legal, tax (GST, Income Tax), and audit obligations
      (typically up to 8 years). You can delete individual conversations from the dashboard at any time.
    </p>

    <H2>7. Security</H2>
    <p>
      We use industry-standard safeguards: TLS encryption in transit, encryption at rest, row-level
      security on our database, hashed passwords, and least-privilege access controls. No system is
      100% secure; we will notify you and the Data Protection Board in the event of a personal
      data breach as required under the DPDP Act.
    </p>

    <H2>8. Your rights as a Data Principal</H2>
    <p>Under the DPDP Act, you have the right to:</p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Access a summary of your personal data.</li>
      <li>Correct, complete, update, or erase your data.</li>
      <li>Withdraw consent at any time.</li>
      <li>Nominate another person to exercise your rights in case of death or incapacity.</li>
      <li>Grievance redressal (see below).</li>
    </ul>
    <p>To exercise any right, email <a className="text-accent underline" href="mailto:privacy@consultyourca.ai">privacy@consultyourca.ai</a>.</p>

    <H2>9. Grievance Officer</H2>
    <p>
      If you are not satisfied with how we handle your data, contact our Grievance Officer:<br />
      <strong>Name:</strong> [To be appointed]<br />
      <strong>Email:</strong> <a className="text-accent underline" href="mailto:grievance@consultyourca.ai">grievance@consultyourca.ai</a><br />
      We aim to respond within 30 days. You may also escalate to the Data Protection Board of India.
    </p>

    <H2>10. Children</H2>
    <p>
      The Service is intended for users aged 18+. We do not knowingly collect personal data of
      children without verifiable parental consent as required under the DPDP Act.
    </p>

    <H2>11. Changes</H2>
    <p>
      We may update this Policy from time to time. Material changes will be communicated via email
      or in-app notice. Continued use after changes indicates acceptance.
    </p>

    <H2>12. Contact</H2>
    <p>
      Questions? Email us at <a className="text-accent underline" href="mailto:support@consultyourca.ai">support@consultyourca.ai</a>.
    </p>
  </LegalLayout>
);

export default Privacy;

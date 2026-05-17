import { LegalLayout } from "@/components/legal/LegalLayout";
import { Seo } from "@/components/Seo";

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-xl md:text-2xl font-semibold text-primary mt-8 mb-3">{children}</h2>
);

const Refund = () => (
  <LegalLayout title="Refund & Cancellation Policy" updated="22 April 2026">
    <Seo
      title="Refund & Cancellation — ConsultYourCA AI"
      description="Refund eligibility, cancellation process and free-trial details for ConsultYourCA AI subscriptions."
      path="/refund"
    />
    <p>
      We want you to be fully satisfied with <strong>ConsultYourCA AI</strong>. This policy explains when
      and how you can cancel your subscription and request a refund.
    </p>

    <H2>1. 7-day free trial</H2>
    <p>
      Every new account gets a 7-day free trial with a limited number of queries. No payment is
      collected during the trial. You will not be auto-charged — you must explicitly subscribe to
      continue after the trial ends.
    </p>

    <H2>2. Cancellation</H2>
    <p>
      You can cancel your subscription at any time from your dashboard under{" "}
      <strong>Settings → Billing</strong>. Cancellation takes effect at the end of the current
      billing period; you retain access until then.
    </p>

    <H2>3. Refund eligibility</H2>
    <ul className="list-disc pl-6 space-y-1">
      <li>
        <strong>First-time subscribers:</strong> full refund if you request within{" "}
        <strong>7 days</strong> of your first payment, provided usage does not exceed{" "}
        <strong>50 queries</strong>.
      </li>
      <li>
        <strong>Renewals:</strong> non-refundable. Please cancel before the renewal date if you do not wish to continue.
      </li>
      <li>
        <strong>Annual plans:</strong> pro-rata refund of unused months, minus a 10% administrative fee, within 30 days of purchase.
      </li>
      <li>
        <strong>Service outages:</strong> if the Service is unavailable for more than 24 consecutive hours due to our fault, we will credit a pro-rata extension of your subscription.
      </li>
    </ul>

    <H2>4. Not eligible for refund</H2>
    <ul className="list-disc pl-6 space-y-1">
      <li>Dissatisfaction with AI output quality (please verify output against official sources — see our Terms).</li>
      <li>Account terminated for breach of our Terms of Service.</li>
      <li>Add-ons or one-time purchases after use.</li>
    </ul>

    <H2>5. How to request a refund</H2>
    <p>
      Email <a className="text-accent underline" href="mailto:billing@consultyourca.ai">billing@consultyourca.ai</a> from your registered email with:
    </p>
    <ul className="list-disc pl-6 space-y-1">
      <li>Your registered email and payment ID / invoice number</li>
      <li>Reason for refund</li>
    </ul>
    <p>
      Approved refunds are processed to the original payment method within{" "}
      <strong>7–10 business days</strong>. Bank processing times may add 2–5 additional days.
    </p>

    <H2>6. GST</H2>
    <p>
      All prices are inclusive of GST at the applicable rate. GST on refunded amounts is adjusted
      per Indian tax law.
    </p>

    <H2>7. Contact</H2>
    <p>
      Questions? Email <a className="text-accent underline" href="mailto:billing@consultyourca.ai">billing@consultyourca.ai</a>.
    </p>
  </LegalLayout>
);

export default Refund;

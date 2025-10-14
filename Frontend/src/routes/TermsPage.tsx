// src/pages/TermsPage.tsx
import React from "react";
import { Link } from "react-router-dom";

const TermsPage: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-4">Terms of Service</h2>

      <p className="text-lg">
        Welcome to JGAA Thai Restaurant! By using our services, including
        placing orders and managing your account, you agree to the following
        Terms of Service. Please read them carefully.
      </p>

      <h3 className="font-semibold text-lg mt-4">1. Account Registration</h3>
      <p className="text-lg">
        You must create an account to place orders with us. During registration,
        you must provide accurate and up-to-date information. You are
        responsible for maintaining the confidentiality of your account
        information and password.
      </p>

      <h3 className="font-semibold text-lg mt-4">2. Use of Services</h3>
      <p className="text-lg">
        Our services, including ordering food, making reservations, and using
        promotions, are available only for personal use. You agree not to use
        our services for any illegal or unauthorized activities.
      </p>

      <h3 className="font-semibold text-lg mt-4">3. Payment Terms</h3>
      <p className="text-lg">
        All payments made for food orders or reservations are due at the time of
        purchase. We accept various payment methods including credit/debit
        cards, and payment services.
      </p>

      <h3 className="font-semibold text-lg mt-4">
        4. Cancellations and Refunds
      </h3>
      <p className="text-lg">
        Orders can be canceled within a specified period as mentioned in the
        order confirmation. Refunds will be processed based on our refund
        policy, which is available in the order terms.
      </p>

      <h3 className="font-semibold text-lg mt-4">
        5. Privacy and Data Security
      </h3>
      <p className="text-lg">
        We take your privacy seriously. Any personal information you provide,
        such as your name, email address, and payment details, will be used only
        for order processing and account management. We do not sell or share
        your data with third parties without your consent.
      </p>

      <h3 className="font-semibold text-lg mt-4">6. Modifications</h3>
      <p className="text-lg">
        We reserve the right to modify or update these Terms of Service at any
        time. Any changes will be posted on this page, and the revised Terms of
        Service will take effect immediately upon posting.
      </p>

      <h3 className="font-semibold text-lg mt-4">7. Termination of Account</h3>
      <p className="text-lg">
        We may suspend or terminate your account if you violate any of these
        Terms of Service. If your account is terminated, you will no longer have
        access to our services.
      </p>

      <h3 className="font-semibold text-lg mt-4">8. Limitation of Liability</h3>
      <p className="text-lg">
        We are not liable for any damages arising from the use of our website,
        services, or any content that you access through our platform. We do not
        guarantee uninterrupted service.
      </p>

      <h3 className="font-semibold text-lg mt-4">9. Governing Law</h3>
      <p className="text-lg">
        These Terms of Service are governed by the laws of [Your Location] and
        any disputes will be resolved under the jurisdiction of the courts in
        [Your Location].
      </p>

      <h3 className="font-semibold text-lg mt-4">10. Contact Us</h3>
      <p className="text-lg">
        If you have any questions or concerns regarding these Terms of Service,
        feel free to contact us at support@jgaathai.com.
      </p>

      <div className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">
          Go Back to Login
        </Link>
      </div>
    </div>
  );
};

export default TermsPage;

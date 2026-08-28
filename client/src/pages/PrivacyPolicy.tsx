import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy - Eclectik</title>
        <meta name="description" content="Privacy Policy for Eclectik BV. Learn how we collect, use, store, and protect your personal data." />
      </Helmet>
      
      <div className="bg-white pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-ec-navy">Privacy Policy</h1>
          
          <div className="text-[17px] leading-[1.75] text-ec-body [&_strong]:font-semibold [&_strong]:text-ec-body-strong [&_a]:text-ec-red [&_a]:font-semibold [&_a:hover]:text-ec-red-hover">
            <p className="text-lg font-semibold text-ec-body-strong mb-8">Effective Date: 11-27-2024</p>
            
            <p className="mb-6">
              At <strong>Eclectik BV</strong> ("we," "our," or "us"), we are committed to safeguarding your privacy. This Privacy Policy outlines how we collect, use, store, and protect your personal data in compliance with applicable data protection laws, including the General Data Protection Regulation (GDPR).
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">1. Who We Are</h2>
            <p className="mb-4">Eclectik BV is dedicated to transforming workplace environments through three pillars:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Insightful Metrics:</strong> Utilizing advanced data analytics to understand employee behavior and satisfaction, identify trends, and measure the impact of employee experience efforts.</li>
              <li><strong>People Science:</strong> Leveraging organizational psychology and behavioral science to foster positive, equitable, and flourishing workplace cultures that boost engagement and productivity.</li>
              <li><strong>Guided Evolution:</strong> Guiding organizations through meaningful culture transformations that align with strategic goals for continuous improvement and innovation.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">2. Information We Collect</h2>
            <p className="mb-4">We may collect and process the following types of personal data:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, and mailing address.</li>
              <li><strong>Business Information:</strong> Company name, job title, and professional details.</li>
              <li><strong>Usage Data:</strong> Details about your interactions with our website, applications, or services, such as IP addresses, browser type, and activity logs.</li>
              <li><strong>Financial Information:</strong> Payment details for transactions with us.</li>
              <li><strong>Other Information:</strong> Any data you provide to us through surveys, feedback, or direct communication.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">3. How We Use Your Data</h2>
            <p className="mb-4">We use your personal data for purposes such as:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Managing customer relationships and contracts.</li>
              <li>Providing and improving our services.</li>
              <li>Communicating with you regarding offers, projects, and service-related matters.</li>
              <li>Complying with legal obligations.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">4. Legal Bases for Processing</h2>
            <p className="mb-4">We process personal data based on the following legal grounds:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Consent:</strong> When you have explicitly agreed to our use of your data.</li>
              <li><strong>Contractual Necessity:</strong> To fulfill a contract with you.</li>
              <li><strong>Legal Obligation:</strong> Compliance with laws and regulations.</li>
              <li><strong>Legitimate Interests:</strong> To improve our services and manage our business.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">5. How We Share Your Information</h2>
            <p className="mb-4">We may share your personal data with:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Third-party service providers for business operations (Cloud Services).</li>
              <li>Legal authorities if required by law or for legal protection.</li>
              <li>Any successors or purchasers in the event of a merger or sale.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">6. Data Storage and Security</h2>
            <p className="mb-6">
              We take appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely within the European Economic Area (EEA).
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">7. Rights of Data Subjects in Our Systems (HR and CRM)</h2>
            <p className="mb-4">
              Eclectik BV uses a Customer Relationship Management (CRM) system to securely store and manage data relating to customer interactions, inquiries, and business relationships. If your personal data is stored in our CRM system, you have the following rights under GDPR:
            </p>
            <div className="space-y-4 mb-6">
              <p><strong>7.1. Right to Access:</strong> You have the right to request access to the personal data we hold about you in our CRM system. This includes details on how your data is used, the purpose of the processing, and with whom your data is shared.</p>
              <p><strong>7.2. Right to Rectification:</strong> If the data we hold in our CRM system is inaccurate or incomplete, you have the right to request corrections or updates to ensure its accuracy.</p>
              <p><strong>7.3. Right to Erasure:</strong> You can request the deletion of your personal data from our CRM system, provided there is no overriding legal obligation or legitimate interest for us to retain it.</p>
              <p><strong>7.4. Right to Restriction of Processing:</strong> You have the right to request that we limit the processing of your data in our CRM system. This means we will store your data but cease any active use of it, subject to specific circumstances.</p>
              <p><strong>7.5. Right to Data Portability:</strong> You have the right to request a copy of your data from our CRM system in a structured, commonly used, and machine-readable format. You may also request that we transfer your data directly to another organization where technically feasible.</p>
              <p><strong>7.6. Right to Object:</strong> You can object to the processing of your data stored in our CRM system for certain purposes, such as marketing activities. Upon receiving your objection, we will stop processing your data for these purposes unless we have a compelling legitimate interest or a legal requirement to continue.</p>
              <p><strong>7.7. Right to Withdraw Consent:</strong> If our processing relies on your consent, you can withdraw your consent at any time. This will not affect the lawfulness of processing based on consent before its withdrawal.</p>
              <p><strong>7.8. Right to File a Complaint:</strong> If you believe we have not handled your data in accordance with this Privacy Policy or applicable data protection laws, you have the right to file a complaint with a relevant supervisory authority.</p>
            </div>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">8. Rights of Data Subjects in Our Email System (Microsoft 365)</h2>
            <p className="mb-6">
              Eclectik BV utilizes Microsoft 365 for our email communications, ensuring robust security and compliance with data protection regulations. Microsoft, as our email service provider, is committed to upholding data subject rights in compliance with the General Data Protection Regulation (GDPR) and other applicable privacy laws. They provide transparency and control by allowing individuals to view, export, delete, and manage their personal data. More information about Microsoft's data protection practices can be found in the Microsoft Privacy Statement.
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">9. How We Use and Secure Our Systems</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Data Minimization:</strong> Only necessary information is stored in our systems to fulfill business purposes.</li>
              <li><strong>Access Control:</strong> Access to the systems is restricted to authorized personnel who require it for legitimate business activities.</li>
              <li><strong>Encryption:</strong> Data in the systems is encrypted to prevent unauthorized access.</li>
              <li><strong>Retention Periods:</strong> Personal data in our systems is retained only for as long as necessary to fulfill its purpose or comply with legal obligations.</li>
            </ul>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">10. Cookies and Tracking Technologies</h2>
            <p className="mb-6">
              We use cookies and similar technologies to enhance your experience on our website. You can manage your cookie preferences through your browser settings and by the cookie consent settings on our site.
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">11. International Data Transfers</h2>
            <p className="mb-6">
              If we transfer your data outside the EEA, we ensure appropriate safeguards are in place, such as standard contractual clauses or adequacy decisions.
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">12. Data Retention</h2>
            <p className="mb-6">
              We retain your data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="mb-6">
              We may update this Privacy Policy periodically. Changes will be communicated through our website or other appropriate channels.
            </p>

            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">14. Contact Us</h2>
            <p className="mb-6">
              For questions, concerns, or requests regarding your personal data, please contact us.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

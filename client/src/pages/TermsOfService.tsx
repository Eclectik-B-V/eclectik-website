import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";

export default function TermsOfService() {
  return (
    <Layout>
      <Helmet>
        <title>Terms of Service - Eclectik</title>
        <meta name="description" content="General Terms and Conditions for Eclectik BV. Read our service agreements, software licenses, and legal obligations." />
      </Helmet>
      
      <div className="bg-white pt-14 pb-20 lg:pt-20 lg:pb-24">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8 text-ec-navy">General Terms & Conditions</h1>
          
          <div className="text-[17px] leading-[1.75] text-ec-body [&_strong]:font-semibold [&_strong]:text-ec-body-strong [&_a]:text-ec-red [&_a]:font-semibold [&_a:hover]:text-ec-red-hover">
            <h2 className="text-2xl font-bold text-ec-navy mt-10 mb-4">General Terms and Conditions Eclectik B.V.</h2>
            <p className="mb-6">
              Located in Haarlem, The Netherlands. (Chamber of Commerce number: 94892652)
            </p>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">1. Definitions</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>1.1 Eclectik:</strong> Refers to Eclectik B.V. the provider of consulting, - services, and license sales.</li>
              <li><strong>1.2 Client:</strong> The individual or legal entity that enters into an agreement with Eclectik for consulting, - services, or the purchase of software licenses.</li>
              <li><strong>1.3 Agreement:</strong> Any contract or legal arrangement between Eclectik and the Client regarding the provision of consulting, - services or software licenses.</li>
              <li><strong>1.4 Services:</strong> Consulting, technical support, implementation, training, and other services provided by Eclectik.</li>
              <li><strong>1.5 License:</strong> The rights granted to the Client to use the software under the terms defined by the third-party software provider.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">2. Scope of Services</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>2.1</strong> Eclectik shall provide consulting, - services, and software licenses as agreed upon with the Client, subject to the terms outlined in the agreement.</li>
              <li><strong>2.2</strong> The specific nature and scope of the services and/or software license will be defined in the statement of work and/or any related proposals, quotes, or orders provided to the Client.</li>
              <li><strong>2.3</strong> All services are provided based on the information and instructions given by the Client. Eclectik cannot be held liable for outcomes based on incomplete or incorrect information provided by the Client.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">3. Software Licenses</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>3.1</strong> Eclectik is a reseller of third-party licenses. The Client receives a non-exclusive, non-transferable license to use this third-party software in accordance with the terms set forth by this third party.</li>
              <li><strong>3.2</strong> The license provided is subject to any applicable third-party terms and conditions. The Client agrees to comply with any additional terms set by third-party software vendors.</li>
              <li><strong>3.3</strong> The Client may not copy, modify, reverse-engineer, decompile, or distribute the software unless explicitly permitted by the license or applicable law.</li>
              <li><strong>3.4</strong> The license is valid for the agreed-upon term and may be subject to renewal or termination as specified in the agreement.</li>
              <li><strong>3.5</strong> If the Client fails to comply with the license terms, Eclectik reserves the right to terminate the license immediately without prior notice.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">4. Fees and Payment</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>4.1</strong> Fees for services and software licenses will be outlined in the agreement or any associated documentation, such as quotes or proposals.</li>
              <li><strong>4.2</strong> Payment is due within 30 days from the invoice date, unless otherwise agreed in writing.</li>
              <li><strong>4.3</strong> Late payments may result in the suspension of Services and/or access to software licenses until payment is received in full. The statutory commercial interest may be charged on overdue amounts.</li>
              <li><strong>4.4</strong> All prices are exclusive of VAT and other applicable taxes, unless explicitly stated otherwise.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">5. Intellectual Property</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>5.1</strong> All intellectual property rights, including but not limited to copyrights, trademarks, patents, and proprietary software, remain the property of Eclectik or its licensors.</li>
              <li><strong>5.2</strong> The Client acknowledges that the services provided may involve the use of proprietary tools, methodologies, and software owned by Eclectik or third parties.</li>
              <li><strong>5.3</strong> The Client may not use, reproduce, or distribute any intellectual property provided by Eclectik without express written consent.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">6. Confidentiality</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>6.1</strong> Both parties agree to treat as confidential all information, data, or documents exchanged during the agreement that are identified as confidential or reasonably understood to be confidential.</li>
              <li><strong>6.2</strong> Confidential information may not be disclosed to any third party without prior written consent, except as required by law or for the execution of the agreement.</li>
              <li><strong>6.3</strong> The obligation to maintain confidentiality shall remain in effect for 3 years after the termination of the agreement.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">7. Liability and Warranties</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>7.1</strong> Eclectik shall make reasonable efforts to provide the services with due care and professionalism but makes no guarantees or warranties as to the outcome or performance of the services.</li>
              <li><strong>7.2</strong> Eclectik and the Client shall adhere to the contents of the agreement during the work and execution and shall always be available for oral consultation that is important for the execution of the agreement.</li>
              <li><strong>7.3</strong> Eclectik is not liable for any indirect, consequential, or punitive damages, including but not limited to loss of profits, revenue, or data, arising out of the use of or inability to use the services or software.</li>
              <li><strong>7.4</strong> The total liability of Eclectik for any claim under the agreement shall not exceed the amount paid by the Client for the relevant services or software license in the preceding 6 months.</li>
              <li><strong>7.5</strong> If Eclectik’s insurer does not provide full cover or if the amount paid by the insurer for the damage suffered by the Client is lower than the proven damage suffered the maximum compensation shall be the agreed rate for the project or if a project runs longer than 6 months the compensation shall be a maximum of the project value over the last six months of the agreement.</li>
              <li><strong>7.6</strong> Eclectik does not guarantee uninterrupted or error-free operation of any third-party software provided. Any warranty for software is subject to the terms of the third party’s software license agreement.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">8. Termination</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>8.1</strong> Either party may terminate the agreement upon written notice if the other party breaches any material obligation under the agreement and fails to cure such breach within 30 days after receiving written notice of the breach.</li>
              <li><strong>8.2</strong> Eclectik may terminate the agreement or suspend services after the second reminder for payment remains unanswered and the Client fails to make payment as required or breaches any license terms.</li>
              <li><strong>8.3</strong> Upon termination, the Client must immediately cease using any licensed software and return or destroy any copies in its possession, unless otherwise agreed.</li>
              <li><strong>8.4</strong> The claims of Eclectik on the Client are immediately due in the following cases:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>If after the conclusion of the agreement circumstances become known to Eclectik that give Eclectik good reason to fear that the Client will not meet its obligations (including financial obligations);</li>
                  <li>If Eclectik has asked the Client to provide security for compliance when concluding the agreement and this security is not provided or is insufficient, to be determined by Eclectik;</li>
                  <li>In the event of liquidation, bankruptcy or suspension of payment of the Client.</li>
                </ul>
              </li>
              <li><strong>8.5</strong> A suspension of the Client within the framework of the agreement is not possible. In the above cases Eclectik is authorized to suspend the further execution of the agreement, or to dissolve or terminate the agreement, all without prejudice to the right of Eclectik to claim damages.</li>
              <li><strong>8.6</strong> If Eclectik is unable to execute or complete the agreement due to circumstances beyond its control, it is entitled to the agreed rates for the work already performed and compensation for expenses already incurred.</li>
              <li><strong>8.7</strong> Failure to pay a single invoice on the due date makes the balance due on all other invoices that have not yet passed the due date immediately due and payable. Furthermore, Eclectik is entitled, without prior notice of default, to suspend the execution of the agreement and/or all other agreements with the Client and to charge the Client for all damage and costs resulting from this. A possible complaint will not give rise to any postponement of payment. Immediate payment can be demanded of what is due in due time.</li>
              <li><strong>8.8</strong> All payments by the Client are first made to reduce the interest and costs due and then to the principal sum. The Client is not authorized to offset the invoice amount.</li>
              <li><strong>8.9</strong> In the event of late payment, statutory commercial interest will be charged.</li>
              <li><strong>8.10</strong> Eclectik may also cancel the agreements made with prospects on behalf of the Client. The Client cannot claim any compensation.</li>
              <li><strong>8.11</strong> In addition to the extrajudicial costs, all legal process and execution costs that Eclectik must incur shall be borne by the defaulting Client. The Client must pay the actual legal and legal costs incurred, even if these exceed the liquidation rate applied by the relevant court. The Client must therefore reimburse the bills of the lawyer and the bailiff, as well as all other possible legal costs.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">9. Force Majeure</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>9.1</strong> Neither party shall be held liable for any delay or failure to perform its obligations under the agreement due to circumstances beyond its reasonable control, including but not limited to acts of God, war, natural disasters, strikes, or legal restrictions.</li>
              <li><strong>9.2</strong> In the event of force majeure, the affected party shall notify the other party as soon as possible and make reasonable efforts to mitigate the impact of the force majeure event.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">10. Governing Law and Dispute Resolution</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>10.1</strong> The agreement shall be governed by and construed in accordance with the Dutch laws.</li>
              <li><strong>10.2</strong> All agreements between the parties are subject to Dutch law. All disputes fall under the exclusive jurisdiction of the Dutch competent court in the district where Company has its head office.</li>
            </ul>

            <h3 className="text-xl font-bold text-ec-navy mt-8 mb-3">11. Miscellaneous</h3>
            <ul className="list-none pl-0 mb-6 space-y-2">
              <li><strong>11.1</strong> Any changes or amendments to the agreement must be made in writing and signed by both parties.</li>
              <li><strong>11.2</strong> If any provision of the agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</li>
              <li><strong>11.3</strong> The Client may not assign or transfer its rights or obligations under the agreement without prior written consent from Eclectik.</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

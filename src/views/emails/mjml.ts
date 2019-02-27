import mjml2html from 'mjml';

export const SubscriptionMJMLToHTMLConverter = ({ company_owner, company_name, invoice_total, subscription_url }) => mjml2html(`
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text
            font-size="22px"
            color="#434856"
            font-family="'Roboto', sans-serif">
              Dear ${company_owner},
          </mj-text>
          <mj-text
            padding-left="40px"
            font-size="17px"
            color="#434856"
            font-family="'Roboto', sans-serif">
              We've noticed that you've reached the limit of our free tier licensing.<br/> <br/>
              ${company_name} has issued Invoices of ${invoice_total} and that means you have been automatically added
              to our paid subscription plan. <br/> <br/>
              Please click to add your credit card details to ensure that you don't lose access to your Kudoo company.
          </mj-text>
          <mj-button
            font-family="'Roboto', sans-serif;"
            font-size="14px"
            font-weight="bold"
            border-radius= "200px;"
            background-color= "rgb(41, 169, 219);"
            href=${subscription_url}>
              Add Credit Card Details
          </mj-button>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`);

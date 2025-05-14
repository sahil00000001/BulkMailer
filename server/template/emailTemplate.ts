export const getEmailTemplate = (): string => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .signature {
        margin-top: 20px;
        border-top: 1px solid #eee;
        padding-top: 10px;
      }
      .signature p {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p>Dear [Name],</p>
      
      <p>I hope this message finds you in great health and high spirits.</p>
      
      <p>I just wanted to reach out and say hello. I trust everything is going well at [Company Name] in your role as [Designation]. I have a few things I'd love to share with you and would really appreciate the opportunity to connect whenever you have some time.</p>
      
      <p>Looking forward to hearing from you soon.</p>
      
      <div class="signature">
        <p>Warm regards,</p>
        <p>[SENDER_NAME]</p>
        <p>Product Owner</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

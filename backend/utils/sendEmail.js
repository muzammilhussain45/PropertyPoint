export const sendEmail = async (options) => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();

  if (!brevoApiKey) {
    console.error('Missing Brevo API key in the .env file');
    throw new Error('Missing email API key');
  }

  const data = {
    sender: {
      name: 'Real Estate Platform',
      email: process.env.EMAIL_USER,
    },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: options.message,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Email sent successfully via Brevo', result);
    } else {
      console.error('Brevo API key error:', result);
      throw new Error(result.message || 'Could not send email via Brevo');
    }
  } catch (error) {
    console.error('Brevo email error:', error.message);
    throw new Error('Could not send email via Brevo');
  }
};

export default sendEmail;
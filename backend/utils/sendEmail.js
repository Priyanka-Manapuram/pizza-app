const https = require("https");

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const data = JSON.stringify({
      sender: { name: "PizzaApp", email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: "api.brevo.com",
          path: "/v3/smtp/email",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log(`Email sent to ${to}`);
              resolve(body);
            } else {
              reject(new Error(`Brevo error: ${body}`));
            }
          });
        }
      );
      req.on("error", reject);
      req.write(data);
      req.end();
    });
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};
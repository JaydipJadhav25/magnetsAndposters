import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jaydipdjadhav@gmail.com",
    pass: process.env.PASS, // the 16-char app password
  },
});

export async function sendEmailToConfirmedOrder(
  to,
  name = "User",
  orderId = "12345",
  items = [],
  totalAmount = "0",
) {
  const brandName = "magnetAndPosters"; // 🔥 change this
  const brandColor = "#ff4d6d"; // main brand color

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">
          ${item.name} (${item.variant || "Default"})
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">
          ₹${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  const mailOptions = {
    from: "jaydipdjadhav@gmail.com",
    to,
    subject: `🎉 ${brandName} Order Confirmed (#${orderId})`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Order Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<!-- MAIN CONTAINER -->
<table width="600" style="background:#ffffff;margin:20px;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(90deg, ${brandColor}, #ff758f);padding:25px;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;">${brandName}</h1>
      <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">
        Turning your memories into beautiful prints 💖
      </p>
    </td>
  </tr>

  <!-- SUCCESS BANNER -->
  <tr>
    <td style="padding:25px;text-align:center;">
      <h2 style="margin:0;color:#333;">🎉 Order Confirmed!</h2>
      <p style="color:#777;margin-top:10px;">
        Thank you for trusting ${brandName}
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="padding:0 30px 30px;">
      
      <h3 style="margin-top:0;">Hi ${name}, 👋</h3>
      
      <p style="color:#555;line-height:1.6;">
        Your order has been successfully placed and is now being processed.
        Our team is excited to craft your custom magnets/posters with care.
      </p>

      <!-- ORDER ID -->
      <div style="background:#f9fafb;padding:15px;border-radius:8px;margin:20px 0;">
        <strong>Order ID:</strong> #${orderId}
      </div>

      <!-- ITEMS TABLE -->
      <table width="100%" style="border-collapse:collapse;">
        <thead>
          <tr style="background:#f1f3f5;">
            <th style="padding:12px;text-align:left;">Product</th>
            <th style="padding:12px;text-align:center;">Qty</th>
            <th style="padding:12px;text-align:right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- TOTAL -->
      <p style="text-align:right;font-size:18px;margin-top:20px;color:#333;">
        <strong>Total: ₹${totalAmount}</strong>
      </p>

      <!-- STATUS BOX -->
      <div style="margin-top:25px;padding:15px;background:#fff0f3;border-left:4px solid ${brandColor};border-radius:6px;">
        <p style="margin:0;color:#555;">
          🛠️ Your order is being prepared<br/>
          📦 Shipping update will be shared soon<br/>
          ⏱️ Estimated delivery: 3–5 working days
        </p>
      </div>

      <!-- CTA BUTTON -->
      <div style="text-align:center;margin-top:30px;">
        <a href="https://yourwebsite.com/orders/${orderId}"
           style="background:${brandColor};color:#fff;padding:14px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
          Track Your Order
        </a>
      </div>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#111;color:#bbb;padding:25px;text-align:center;font-size:13px;">
      
      <p style="margin:0 0 8px;">
        ❤️ Made with love by ${brandName}
      </p>

      <p style="margin:0 0 8px;">
        Need help? Contact us at 
        <a href="mailto:support@yourwebsite.com" style="color:#fff;text-decoration:none;">
          support@yourwebsite.com
        </a>
      </p>

      <p style="margin:0;font-size:12px;color:#777;">
        © ${new Date().getFullYear()} ${brandName}. All rights reserved.
      </p>

    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Send error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendEmailToUserUpdateStatus(
  to,
  name = "User",
  orderId,
  orderStatus,
) {
  const brandName = "magnetAndPosters";
  const brandColor = "#ff4d6d";

  // 🎯 Dynamic Content Based on Status
  const statusConfig = {
    placed: {
      title: "📝 Order Placed",
      message: "We've received your order and will confirm it shortly.",
      color: "#6c757d",
    },
    processing: {
      title: "🛠️ Processing Your Order",
      message: "Your custom product is being crafted with care.",
      color: "#f59f00",
    },
    shipped: {
      title: "🚚 Order Shipped",
      message: "Your order is on the way! Get ready to receive it soon.",
      color: "#339af0",
    },
    delivered: {
      title: "🎉 Order Delivered",
      message: "Your order has been delivered. We hope you love it!",
      color: "#40c057",
    },
    cancelled: {
      title: "❌ Order Cancelled",
      message:
        "Your order has been cancelled. If this wasn't expected, contact support.",
      color: "#fa5252",
    },
  };

  const current = statusConfig[orderStatus] || statusConfig.placed;

  const mailOptions = {
    from: "jaydipdjadhav@gmail.com",
    to,
    subject: `${brandName} • ${current.title} (#${orderId})`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Order Update</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<!-- CONTAINER -->
<table width="600" style="background:#ffffff;margin:20px;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(90deg, ${brandColor}, #ff758f);padding:20px;text-align:center;color:#fff;">
      <h1 style="margin:0;">${brandName}</h1>
    </td>
  </tr>

  <!-- STATUS -->
  <tr>
    <td style="padding:25px;text-align:center;">
      <h2 style="margin:0;color:${current.color};">
        ${current.title}
      </h2>
      <p style="color:#777;margin-top:10px;">
        Order ID: #${orderId}
      </p>
    </td>
  </tr>

  <!-- BODY -->
  <tr>
    <td style="padding:0 30px 30px;">
      
      <h3>Hi ${name}, 👋</h3>

      <p style="color:#555;line-height:1.6;">
        ${current.message}
      </p>

      <!-- TIMELINE -->
      <div style="margin-top:25px;padding:15px;background:#f9fafb;border-radius:8px;">
        <p style="margin:0;font-size:14px;color:#555;">
          📦 Order Status Progress:
        </p>

        <p style="margin:10px 0 0;font-size:13px;color:#777;">
          ✔️ Placed → ✔️ Confirmed → 🔄 Processing → 🚚 Shipped → 🎉 Delivered
        </p>
      </div>

      <!-- CTA -->
      ${
        orderStatus !== "cancelled"
          ? `
      <div style="text-align:center;margin-top:30px;">
        <a href="https://yourwebsite.com/orders/${orderId}"
           style="background:${brandColor};color:#fff;padding:12px 22px;text-decoration:none;border-radius:8px;font-weight:bold;">
          View Order
        </a>
      </div>
      `
          : ""
      }

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#111;color:#bbb;padding:20px;text-align:center;font-size:12px;">
      <p style="margin:0 0 6px;">❤️ ${brandName}</p>
      <p style="margin:0;">
        Need help? support@yourwebsite.com
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Send error:", error);
    return { success: false, error: error.message };
  }
}

const emailStyles = `
<style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    background-color: #f4f4f4;
    padding: 20px;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  .header, .footer {
    text-align: center;
    padding: 20px;
  }
  .header img {
    max-width: 150px;
  }
  .content {
    padding: 20px;
  }
  .content p {
    margin: 10px 0;
  }
  .content ul {
    padding-left: 20px;
  }
  .footer {
    font-size: 12px;
    color: #777;
    border-top: 1px solid #ddd;
    padding-top: 20px;
    margin-top: 20px;
  }
  .footer p {
    margin: 0;
  }
  .button {
    display: inline-block;
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    border-radius: 5px;
  }
  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  .invoice-table th, .invoice-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  .invoice-table th {
    background-color: #f2f2f2;
  }
  .invoice-table tfoot tr {
    background-color: #f2f2f2;
  }
</style>
`;

const header = `
<div class="header">
  <img src="https://res.cloudinary.com/dsuxj7rdd/image/upload/v1722585731/jxsu6q8ujgzjry2zlgwb.png" class="center" alt="FreshFinds" style="max-width: 150px;">
  <p>(000) 123 45 67 | noreply.freshfinds1@gmail.com</p>
  <h2>WE LOOK FORWARD TO SERVING YOU!</h2>
</div>
`;

const footer = `
<div class="footer">
  <p>This is an automated message, please do not reply directly to this email.</p>
  <p>&copy; ${new Date().getFullYear()} FreshFinds. All rights reserved.</p>
  <p>4562 Hazy Panda Limits, Chair Crossing, Kentucky, US, 607898</p>
  <p><a href="#">Visit Us</a> | <a href="#">Privacy Policy</a> | <a href="#">Terms of Use</a></p>
  <p>No longer want to receive these emails? <a href="#">Unsubscribe</a>.</p>
</div>
`;

const sellerApprovalEmailContent = (seller) => `
<html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      ${header}
      <div class="content">
        <p>Dear ${seller.userName},</p>
        <p>Your seller registration has been approved by the admin. You can now start selling on FreshFinds.</p>
        <p>Thank you for joining us!</p>
        <p>Best regards,<br/>The FreshFinds Team</p>
      </div>
      ${footer}
    </div>
  </body>
</html>
`;

const billEmailContent = (customer, bill) => `
<html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      ${header}
      <div class="content">
        <p>Dear ${customer.userName},</p>
        <p>Here is your bill for the recent purchase:</p>
        <table class="invoice-table">
          <tr>
            <th>Order ID</th><td>${bill.orderId}</td>
          </tr>
          <tr>
            <th>Product</th><td>${bill.productName}</td>
          </tr>
          <tr>
            <th>Quantity</th><td>${bill.productQuantity}</td>
          </tr>
          <tr>
            <th>Product Cost</th><td>${bill.productCost} &#8377;</td>
          </tr>
          <tr>
            <th>Delivery Cost</th><td>${bill.deliveryCost} &#8377;</td>
          </tr>
          <tr>
            <th>Total Amount</th><td>${bill.totalAmount} &#8377;</td>
          </tr>
          <tr>
            <th>Seller</th><td>${bill.sellerName}</td>
          </tr>
          <tr>
            <th>Order Date</th><td>${bill.createdAt}</td>
          </tr>
        </table>
        <p>Thank you for shopping with FreshFinds!</p>
        <p>Best regards,<br/>The FreshFinds Team</p>
      </div>
      ${footer}
    </div>
  </body>
</html>
`;

const registrationEmailContent = (user) => `
<html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      ${header}
      <div class="content">
        <p>Dear ${user.userName},</p>
        <p>Welcome to FreshFinds! Your registration is successful.</p>
        <p>Thank you for joining us!</p>
        <p>Best regards,<br/>The FreshFinds Team</p>
      </div>
      ${footer}
    </div>
  </body>
</html>
`;

const orderEmailContent = (user, order, product, quantity,productCost,deliveryCost, totalAmount) => `
<html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      ${header}
      <div class="content">
        <p>Dear ${user.userName},</p>
        <p>Your order has been placed successfully! Here are the details:</p>
        <table class="invoice-table">
          <tr>
            <th>Order ID</th><td>${order._id}</td>
          </tr>
          <tr>
            <th>Product</th><td>${product.name}</td>
          </tr>
          <tr>
            <th>Quantity</th><td>${quantity}</td>
          </tr>
          <tr>
            <th>Product Cost</th><td>${productCost} &#8377;</td>
          </tr>
          <tr>
            <th>Delivery Cost</th><td>${deliveryCost} &#8377;</td>
          </tr>
          <tr>
            <th>Total Amount</th><td>${totalAmount} &#8377;</td>
          </tr>
        </table>
        <p>Thank you for shopping with FreshFinds!</p>
        <p>Best regards,<br/>The FreshFinds Team</p>
      </div>
      ${footer}
    </div>
  </body>
</html>
`;

const cancelOrderEmailContent = (user, order, product) => `
<html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      ${header}
      <div class="content">
        <p>Dear ${user.userName},</p>
        <p>Your order has been canceled by you:</p>
        <table class="invoice-table">
          <tr>
            <th>Order ID</th><td>${order._id}</td>
          </tr>
          <tr>
            <th>Product</th><td>${product.name}</td>
          </tr>
        </table>
        <p>Thank you for shopping with FreshFinds!</p>
        <p>Best regards,<br/>The FreshFinds Team</p>
      </div>
      ${footer}
    </div>
  </body>
</html>
`;

const orderStatusUpdateEmailContent = (user, order, newStatus) => `
<html>
  <head>${emailStyles}</head>
  <body>
    <div class="email-container">
      ${header}
      <div class="content">
        <p>Dear ${user.userName},</p>
        <p>Your order status has been updated:</p>
        <table class="invoice-table">
          <tr>
            <th>Order ID</th><td>${order._id}</td>
          </tr>
          <tr>
            <th>New Status</th><td>${newStatus}</td>
          </tr>
        </table>
        <p>Thank you for shopping with FreshFinds!</p>
        <p>Best regards,<br/>The FreshFinds Team</p>
      </div>
      ${footer}
    </div>
  </body>
</html>
`;

module.exports = {
  sellerApprovalEmailContent,
  billEmailContent,
  registrationEmailContent,
  orderEmailContent,
  cancelOrderEmailContent,
  orderStatusUpdateEmailContent,
};

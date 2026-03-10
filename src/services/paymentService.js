const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : "http://localhost:5000";
const initializePaymentUrl = `${apiBaseUrl}/api/payment/initialize`;

export async function startPayment(orderId) {
  const res = await fetch(initializePaymentUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId })
  });

  const data = await res.json();
  window.location.href = data.authorization_url;
}

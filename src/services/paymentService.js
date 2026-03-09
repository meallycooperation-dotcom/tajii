export async function startPayment(orderId) {
  const res = await fetch("/api/payments/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId })
  });

  const data = await res.json();
  window.location.href = data.authorization_url;
}

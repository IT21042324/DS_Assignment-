import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackendAPI } from "../context/useBackendAPI";

export function PayPalCheckoutButton({ product }) {
  const { purchaseItem } = useBackendAPI();
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const usdAmount = parseFloat((product.price / 300.0).toFixed(2));

  const handleApprove = async () => {
    await purchaseItem({ total: usdAmount });
  };

  return (
    <>
      {error && <div>{error}</div>}
      <PayPalButtons
        key={product.id}
        style={{ color: "gold" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                description: product.description,
                amount: {
                  value: parseFloat((product.price / 319.67).toFixed(2)),
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          await actions.order.capture();
          handleApprove();
        }}
        onCancel={() => {
          alert("Payment Cancelled");
          navigate("/buyer/Cart");
        }}
        onError={(err) => {
          setError(err);
        }}
      />
    </>
  );
}

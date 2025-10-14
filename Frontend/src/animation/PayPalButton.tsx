import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import React from "react";

interface PayPalButtonProps {
  amount: number;
  onPaymentSuccess: (transactionId?: string) => void;
  onPaymentError: (error: any) => void;
  clientId: string;
  userId: string;
  orderQuantity: number;
  menuImg: string;
  fundingSource?: string;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError,
  clientId,
}) => {
  return (
    <div className="mt-6">
      <PayPalScriptProvider
        options={{
          clientId:
            clientId ||
            "ATmeAPa_uOr4eollCsJDORpteDdcc15R79aU1jPpyF_ofMjwk1ILbUdwgr2e4wLFH_habF9j8wnsgPt-",
          currency: "PHP",
        }}
      >
        <script
          type="text/javascript"
          src={`https://www.paypal.com/sdk/js?client-id=${
            clientId ||
            "ATmeAPa_uOr4eollCsJDORpteDdcc15R79aU1jPpyF_ofMjwk1ILbUdwgr2e4wLFH_habF9j8wnsgPt-"
          }&currency=PHP`}
          onLoad={() => console.log("✅ PayPal SDK Script Loaded Successfully")}
          onError={(error) =>
            console.error("❌ Error loading PayPal SDK Script:", error)
          }
        />

        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={(_data, actions) => {
            console.log("🟡 Creating PayPal order...");
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "PHP",
                    value: amount.toString(),
                  },
                },
              ],
            });
          }}
          onApprove={async (_data, actions) => {
            try {
              if (actions?.order) {
                const order = await actions.order.capture();
                console.log("✅ PayPal Order captured:", order);

                if (order.purchase_units && order.purchase_units.length > 0) {
                  const transactionId =
                    order.purchase_units[0]?.payments?.captures?.[0]?.id;

                  if (transactionId) {
                    console.log("💳 Captured Transaction ID:", transactionId);

                    const capturedOrderId =
                      order.purchase_units[0]?.reference_id || null;
                    console.log("🧾 Captured Order ID:", capturedOrderId);

                    // ✅ Now safely pass the transactionId to the success handler
                    onPaymentSuccess(transactionId);
                  } else {
                    throw new Error("Transaction ID is undefined");
                  }
                } else {
                  throw new Error("No purchase units found in the order.");
                }
              } else {
                throw new Error("Order actions are undefined.");
              }
            } catch (error) {
              console.error("❌ Error capturing PayPal order:", error);
              onPaymentError(error);
            }
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButton;

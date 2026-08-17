import { CheckCircle2, CircleDot, ReceiptText } from "lucide-react";

export type ReceiptStage = "ready" | "processing" | "recorded" | "attention";

type PaymentReceiptProps = {
  stage: ReceiptStage;
  reference?: string;
  amount?: string;
  asset?: string;
  route: string;
  status: string;
  detail: string;
};

const statusCopy: Record<ReceiptStage, string> = {
  ready: "Receipt ready after request creation",
  processing: "Creating your order record",
  recorded: "Order record created",
  attention: "Order needs attention",
};

export default function PaymentReceipt({ stage, reference, amount, asset, route, status, detail }: PaymentReceiptProps) {
  const complete = stage === "recorded";
  return <section className={`payment-receipt payment-receipt-${stage}`} aria-label="Order receipt status">
    <div className="payment-receipt-machine"><div className="payment-receipt-screen"><div className="payment-receipt-status">{complete ? <CheckCircle2 size={17} /> : <CircleDot size={17} className={stage === "processing" ? "receipt-spinner" : ""} />}<span>{statusCopy[stage]}</span></div><ReceiptText size={18} /></div></div>
    <article className="payment-receipt-paper"><div className="payment-receipt-heading"><span>ROTH DIGITAL</span><b>ORDER RECEIPT</b></div><dl><div><dt>Reference</dt><dd>{reference ?? "Created after confirmation"}</dd></div><div><dt>Payment route</dt><dd>{route}</dd></div><div><dt>Record status</dt><dd>{status.replaceAll("_", " ")}</dd></div>{amount && asset ? <div><dt>Recorded amount</dt><dd>{amount} {asset}</dd></div> : null}</dl><p>{detail}</p><small>Shown from the current website record. This receipt does not imply automatic approval, delivery, or payment settlement.</small></article>
  </section>;
}

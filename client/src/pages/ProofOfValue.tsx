import ProofPage from "@/components/ProofPage";

/**
 * De tekst is aangeleverd en staat hier onverkort. De alinea is alleen
 * gebroken waar het betoog draait: eerst wat we modelleren, dan de methode,
 * dan wat je terugkrijgt, en als laatste de doorlooptijd. Er is niets
 * bijgeschreven en niets weggelaten.
 */
export default function ProofOfValue() {
  return (
    <ProofPage
      door="value"
      path="/proof-of-value"
      title="Proof of value"
      description="We model ROI, TCO and adoption economics on your own licence, usage and telemetry data, so your CFO gets an independent value statement they can interrogate."
      eyebrow="PROOF OF VALUE · CFO & CIO"
      heading="What is AI delivering in the P&L?"
      lead="We model ROI, TCO and adoption economics on your own licence, usage and telemetry data."
      body={[
        "The method in one paragraph: cohorts are named in advance, one outcome definition is fixed for the whole analysis, and an econometric estimator with counterfactual estimation isolates the effect of AI from everything else that moves the business.",
        "You receive an independent value statement your CFO can interrogate: what AI contributed, where the value concentrated, and what the next investment decision should assume.",
      ]}
      note="A typical analysis takes four to six weeks, after a two-week data feasibility check."
      closing="The full proof-of-value page, including the benchmark prospectus, opens in November 2026."
    />
  );
}

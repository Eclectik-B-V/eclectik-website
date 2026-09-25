import ProofPage from "@/components/ProofPage";

/**
 * De tekst is aangeleverd en staat hier onverkort. De alinea is alleen
 * gebroken waar het betoog draait: eerst wat rolloutcijfers niet vertellen,
 * dan hoe we lezen, dan wat je terugkrijgt. Er is niets bijgeschreven en niets
 * weggelaten.
 */
export default function ProofOfChange() {
  return (
    <ProofPage
      door="change"
      path="/proof-of-change"
      title="Proof of change"
      description="Rollout numbers tell you what was implemented, not what changed in the work. We read your listening data with people science, whatever instrument you run."
      // De doelgroep breekt als geheel naar de tweede regel in plaats van
      // "LEADERS" alleen te laten hangen. Geen breakpoint: de browser breekt
      // pas voor TRANSFORMATION wanneer het niet meer past.
      eyebrow={
        <>
          PROOF OF CHANGE ·{" "}
          <span className="whitespace-nowrap">TRANSFORMATION LEADERS</span>
        </>
      }
      heading="Is your workforce actually changing?"
      lead="Rollout numbers tell you what was implemented. They do not tell you what changed in the work."
      body={[
        "We read your listening data, whatever instrument you run, with people science: where AI lands as a resource, where it lands as an extra demand, and for whom. Cohorts and outcome definitions are fixed up front, so the reading survives challenge.",
        "You receive an independent picture of how working patterns are actually moving, tied back to real adoption, and the levers that steer it: transparency, perceived fairness and human oversight.",
      ]}
      closing="The full proof-of-change page opens in November 2026."
    />
  );
}

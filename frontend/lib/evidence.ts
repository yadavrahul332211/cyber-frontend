export function splitEvidence(evidence: string): {
  evidence: string;
  remediation: string | null;
} {
  const match = evidence.match(/,?\s*Remediation:\s*([\s\S]*)$/);
  if (!match || match.index === undefined) {
    return { evidence, remediation: null };
  }
  return {
    evidence: evidence.slice(0, match.index).trim(),
    remediation: match[1].trim() || null,
  };
}

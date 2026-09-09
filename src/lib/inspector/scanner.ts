// AI Inspector — client-safe static security scanner.
// Pure functions only: no secrets, no network, no provider SDKs.

export type InspectorStatus = "idle" | "scanning" | "secure" | "risk";
export type InspectorSeverity = "high" | "medium" | "low";
export type InspectorCheckId = "prompt_injection" | "secrets" | "unsafe_code";

export interface InspectorFinding {
  check: InspectorCheckId;
  severity: InspectorSeverity;
  title: string;
  detail: string;
  evidence: string;
}

export interface InspectorCheck {
  id: InspectorCheckId;
  label: string;
  passed: boolean;
  findings: number;
}

export interface InspectorReport {
  score: number;
  grade: string;
  status: Exclude<InspectorStatus, "idle" | "scanning">;
  checks: InspectorCheck[];
  findings: InspectorFinding[];
  hash: string;
  scannedAt: string;
  source: string;
}

export interface InspectorInput {
  /** What the scan covers, e.g. "Builder blueprint" */
  source: string;
  prompt?: string | null;
  /** Any generated text / code / blueprint content. */
  content?: (string | null | undefined)[];
}

export const CHECK_LABELS: Record<InspectorCheckId, string> = {
  prompt_injection: "Prompt Injection",
  secrets: "API кілттері / құпиялар",
  unsafe_code: "XSS / қауіпті код",
};

interface Rule {
  check: InspectorCheckId;
  severity: InspectorSeverity;
  re: RegExp;
  title: string;
  detail: string;
}

const RULES: Rule[] = [
  // Prompt injection
  {
    check: "prompt_injection",
    severity: "high",
    re: /\b(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)\b/i,
    title: "Нұсқауларды елемеу әрекеті",
    detail: "Мәтінде алдыңғы жүйелік нұсқауларды елемеуге бағытталған сөйлем табылды.",
  },
  {
    check: "prompt_injection",
    severity: "high",
    re: /\b(system\s+prompt|developer\s+mode|jailbreak|DAN\s+mode)\b/i,
    title: "Жүйелік промптқа қол жеткізу әрекеті",
    detail: "Жасырын жүйелік нұсқауларды ашуға тырысатын өрнек анықталды.",
  },
  {
    check: "prompt_injection",
    severity: "medium",
    re: /(барлық\s+алдыңғы\s+нұсқаулар|нұсқауларды\s+ұмыт|сен\s+енді\s+басқа)/i,
    title: "Қазақша инъекция өрнегі",
    detail: "Модельдің рөлін өзгертуге тырысатын қазақша тіркес табылды.",
  },
  {
    check: "prompt_injection",
    severity: "medium",
    re: /\b(reveal|print|show)\s+(your|the)\s+(instructions|system|rules|api\s*key)\b/i,
    title: "Құпия нұсқауларды сұрау",
    detail: "Модельден ішкі нұсқауларын не кілттерін сұрайтын өрнек табылды.",
  },
  // Secrets
  {
    check: "secrets",
    severity: "high",
    re: /\bsk-[A-Za-z0-9_-]{16,}\b/,
    title: "OpenAI үлгісіндегі құпия кілт",
    detail: "Кодта ашық жазылған құпия API кілті табылды.",
  },
  {
    check: "secrets",
    severity: "high",
    re: /\b(ghp|gho|ghu|ghs)_[A-Za-z0-9]{20,}\b/,
    title: "GitHub токені",
    detail: "GitHub жеке қатынау токені мәтін ішінде ашық тұр.",
  },
  {
    check: "secrets",
    severity: "high",
    re: /\bAIza[0-9A-Za-z_-]{30,}\b/,
    title: "Google API кілті",
    detail: "Google API кілті кодта ашық жазылған.",
  },
  {
    check: "secrets",
    severity: "high",
    re: /\bAKIA[0-9A-Z]{16}\b/,
    title: "AWS кілті",
    detail: "AWS access key ID табылды.",
  },
  {
    check: "secrets",
    severity: "high",
    re: /\bsb_secret_[A-Za-z0-9_-]{10,}\b/,
    title: "Backend service кілті",
    detail: "Сервер жағындағы құпия кілт клиент кодына түсіп кеткен.",
  },
  {
    check: "secrets",
    severity: "medium",
    re: /\b(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']{12,}["']/i,
    title: "Ашық жазылған құпия мән",
    detail: "Кілт/құпиясөз кодта тікелей жазылған. Оны сервер құпиясына шығар.",
  },
  // Unsafe code
  {
    check: "unsafe_code",
    severity: "high",
    re: /dangerouslySetInnerHTML/,
    title: "dangerouslySetInnerHTML",
    detail: "HTML-ді тікелей енгізу XSS қаупін тудырады.",
  },
  {
    check: "unsafe_code",
    severity: "high",
    re: /\beval\s*\(|new\s+Function\s*\(/,
    title: "eval / new Function",
    detail: "Динамикалық код орындау қауіпті — оны алып таста.",
  },
  {
    check: "unsafe_code",
    severity: "medium",
    re: /\.innerHTML\s*=|document\.write\s*\(/,
    title: "innerHTML / document.write",
    detail: "Тазаланбаған HTML жазу XSS-ке жол ашады.",
  },
  {
    check: "unsafe_code",
    severity: "medium",
    re: /\bchild_process\b|\brequire\s*\(\s*["']child_process["']\s*\)/,
    title: "child_process шақыруы",
    detail: "Жүйелік процесс шақыру қауіпсіз ортада рұқсат етілмейді.",
  },
  {
    check: "unsafe_code",
    severity: "low",
    re: /javascript:\s*[^"'\s]/i,
    title: "javascript: сілтемесі",
    detail: "javascript: протоколы бар сілтеме қауіпті болуы мүмкін.",
  },
];

const PENALTY: Record<InspectorSeverity, number> = { high: 28, medium: 12, low: 5 };

function gradeFor(score: number) {
  if (score >= 97) return "A+";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

function evidenceFor(text: string, re: RegExp) {
  const match = re.exec(text);
  if (!match) return "";
  const raw = match[0];
  const masked = raw.length > 12 ? `${raw.slice(0, 6)}…${raw.slice(-3)}` : raw;
  return masked.slice(0, 48);
}

async function hashOf(payload: string): Promise<string> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
      const bytes = new TextEncoder().encode(payload);
      const digest = await subtle.digest("SHA-256", bytes);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `bx_${hex.slice(0, 24)}`;
    }
  } catch {
    /* fall through */
  }
  let h = 0;
  for (let i = 0; i < payload.length; i += 1) h = (h * 31 + payload.charCodeAt(i)) | 0;
  return `bx_${(h >>> 0).toString(16).padStart(8, "0")}`;
}

/** Runs all static checks over the supplied prompt + generated content. */
export async function scanContent(input: InspectorInput): Promise<InspectorReport> {
  const parts = [input.prompt ?? "", ...(input.content ?? [])].filter(
    (p): p is string => typeof p === "string" && p.length > 0,
  );
  const text = parts.join("\n\n");

  const findings: InspectorFinding[] = [];
  for (const rule of RULES) {
    if (rule.re.test(text)) {
      findings.push({
        check: rule.check,
        severity: rule.severity,
        title: rule.title,
        detail: rule.detail,
        evidence: evidenceFor(text, rule.re),
      });
    }
  }

  const score = Math.max(
    0,
    Math.min(100, 100 - findings.reduce((sum, f) => sum + PENALTY[f.severity], 0)),
  );

  const checks: InspectorCheck[] = (Object.keys(CHECK_LABELS) as InspectorCheckId[]).map((id) => {
    const count = findings.filter((f) => f.check === id).length;
    return { id, label: CHECK_LABELS[id], passed: count === 0, findings: count };
  });

  const scannedAt = new Date().toISOString();
  const hash = await hashOf(`${input.source}|${scannedAt}|${score}|${text.slice(0, 4000)}`);

  return {
    score,
    grade: gradeFor(score),
    status: findings.length > 0 ? "risk" : "secure",
    checks,
    findings,
    hash,
    scannedAt,
    source: input.source,
  };
}

/// <reference lib="webworker" />
import { XMLBuilder, XMLParser } from "fast-xml-parser";

type ParseRequest = {
  type: "parse";
  xml: string;
};

type ParseResponse =
  | { type: "result"; xml: string }
  | { type: "error"; message: string };

const ctx: DedicatedWorkerGlobalScope = self as any;

ctx.onmessage = (e: MessageEvent<ParseRequest>) => {
  try {
    if (e.data.type !== "parse") return;

    const parser = new XMLParser({ ignoreAttributes: false });
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

    const json = parser.parse(e.data.xml);

    // ----- Your transformation here -----
    const transformed = extractRules(json);
    // ------------------------------------

    const outXml = builder.build(transformed);

    ctx.postMessage({ type: "result", xml: outXml } satisfies ParseResponse);
  } catch (err: any) {
    ctx.postMessage({
      type: "error",
      message: err?.message ?? "Unknown worker error",
    } satisfies ParseResponse);
  }
};

// Dummy example – replace with your actual logic
function extractRules(input: any) {
  return { rules: [{ id: 1, name: "Example" }], original: input };
}

import type { ResumePdfData, ShokumuTemplateId } from "./types";
import { ChronologicalTemplate } from "./shokumu/ChronologicalTemplate";
import { TimelineTemplate } from "./shokumu/TimelineTemplate";
import { HighlightTemplate } from "./shokumu/HighlightTemplate";

export function ShokumuKeirekishoDocument({
  data,
  template,
}: {
  data: ResumePdfData;
  template: ShokumuTemplateId;
}) {
  switch (template) {
    case "timeline":
      return <TimelineTemplate data={data} />;
    case "highlight":
      return <HighlightTemplate data={data} />;
    default:
      return <ChronologicalTemplate data={data} />;
  }
}

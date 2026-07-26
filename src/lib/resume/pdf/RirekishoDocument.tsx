import type { ResumePdfData, RirekishoTemplateId } from "./types";
import { TraditionalTemplate } from "./rirekisho/TraditionalTemplate";
import { ModernTemplate } from "./rirekisho/ModernTemplate";
import { SidebarTemplate } from "./rirekisho/SidebarTemplate";

export function RirekishoDocument({
  data,
  template,
}: {
  data: ResumePdfData;
  template: RirekishoTemplateId;
}) {
  switch (template) {
    case "modern":
      return <ModernTemplate data={data} />;
    case "sidebar":
      return <SidebarTemplate data={data} />;
    default:
      return <TraditionalTemplate data={data} />;
  }
}

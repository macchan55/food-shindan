import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData, ResumeFormat } from "./types";
import { formatYearMonth, today } from "./format";
import { PALETTES } from "./theme";

function buildStyles(format: ResumeFormat) {
  const p = PALETTES[format];
  const rich = format === "rich";
  const simple = format === "simple";
  const lineColor = simple ? "#999999" : p.border;

  return StyleSheet.create({
    page: { fontFamily: "NotoSansJP", fontSize: simple ? 8.5 : 9, padding: rich ? 32 : 32, color: "#1a1a1a" },
    title: {
      fontSize: rich ? 18 : 16,
      textAlign: "center",
      marginBottom: rich ? 3 : 4,
      fontWeight: 700,
      color: rich ? p.accent : "#1a1a1a",
      letterSpacing: rich ? 3 : 0,
    },
    titleBar: { width: 50, height: 2, backgroundColor: p.accent, alignSelf: "center", marginBottom: 10 },
    dateLine: { fontSize: 8, textAlign: "right", marginBottom: 4, color: "#555" },
    nameLine: { fontSize: 10, textAlign: "right", marginBottom: 10 },
    sectionTitle: {
      fontSize: 10.5,
      fontWeight: 700,
      marginTop: simple ? 9 : 12,
      marginBottom: 4,
      borderBottom: `1pt solid ${simple ? "#333" : p.accent}`,
      paddingBottom: 2,
    },
    sectionBand: {
      marginTop: 12,
      marginBottom: 5,
      backgroundColor: p.accent,
      borderRadius: 3,
      paddingVertical: 3,
      paddingHorizontal: 8,
    },
    sectionBandText: { fontSize: 10.5, fontWeight: 700, color: p.onAccent },
    paragraph: { fontSize: 9, lineHeight: 1.6 },
    workBlock: {
      marginTop: 8,
      padding: 8,
      border: `0.5pt solid ${lineColor}`,
      borderLeft: rich ? `2.5pt solid ${p.accent}` : `0.5pt solid ${lineColor}`,
      backgroundColor: rich ? p.soft : "transparent",
    },
    workHeader: { fontSize: 9.5, fontWeight: 700, marginBottom: 2 },
    workMeta: { fontSize: 8, color: "#555", marginBottom: 4 },
    workLabel: { fontSize: 8.5, fontWeight: 700, marginTop: 3 },
    workText: { fontSize: 8.5, lineHeight: 1.5, marginTop: 1 },
    emptyNote: { fontSize: 8.5, color: "#999" },
    tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
    tag: {
      fontSize: 7.5,
      color: rich ? p.accent : "#333",
      backgroundColor: rich ? "#ffffff" : "#f0f0f0",
      border: rich ? `0.5pt solid ${p.border}` : undefined,
      borderRadius: 8,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginRight: 4,
      marginTop: 3,
    },
    tagLine: { fontSize: 8, color: "#555", marginTop: 2 },
  });
}

type Styles = ReturnType<typeof buildStyles>;

function SectionTitle({
  format,
  styles,
  children,
}: {
  format: ResumeFormat;
  styles: Styles;
  children: string;
}) {
  if (format === "rich") {
    return (
      <View style={styles.sectionBand}>
        <Text style={styles.sectionBandText}>{children}</Text>
      </View>
    );
  }
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function ShokumuKeirekishoDocument({
  data,
  format,
}: {
  data: ResumePdfData;
  format: ResumeFormat;
}) {
  const styles = buildStyles(format);
  const { profile, workExperiences, qualifications, resume } = data;
  const simple = format === "simple";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>職務経歴書</Text>
        {format === "rich" && <View style={styles.titleBar} />}
        <Text style={styles.dateLine}>{today()}現在</Text>
        <Text style={styles.nameLine}>{profile.fullName || "（未入力）"}</Text>

        <SectionTitle format={format} styles={styles}>
          職務要約
        </SectionTitle>
        <Text style={styles.paragraph}>{resume.workSummary || "（未入力）"}</Text>

        <SectionTitle format={format} styles={styles}>
          職務経歴
        </SectionTitle>
        {workExperiences.length === 0 ? (
          <Text style={styles.emptyNote}>登録された職歴はありません</Text>
        ) : (
          workExperiences.map((w, i) => {
            const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" / ");
            const period = `${formatYearMonth(w.startDate)} 〜 ${
              w.isCurrent ? "現在" : formatYearMonth(w.endDate)
            }`;
            const tags = [w.employmentType, w.jobType, w.position].filter(Boolean) as string[];
            return (
              <View key={i} style={styles.workBlock}>
                <Text style={styles.workHeader}>{label}</Text>
                <Text style={styles.workMeta}>{period}</Text>
                {simple ? (
                  tags.length > 0 && <Text style={styles.tagLine}>{tags.join("／")}</Text>
                ) : (
                  <View style={styles.tagRow}>
                    {tags.map((tag, j) => (
                      <Text key={j} style={styles.tag}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                )}
                {w.mainDuties && (
                  <>
                    <Text style={styles.workLabel}>主な業務</Text>
                    <Text style={styles.workText}>{w.mainDuties}</Text>
                  </>
                )}
                {w.achievements && (
                  <>
                    <Text style={styles.workLabel}>実績</Text>
                    <Text style={styles.workText}>{w.achievements}</Text>
                  </>
                )}
              </View>
            );
          })
        )}

        <SectionTitle format={format} styles={styles}>
          強み
        </SectionTitle>
        <Text style={styles.paragraph}>{resume.strengthsText || "（未入力）"}</Text>

        <SectionTitle format={format} styles={styles}>
          自己PR
        </SectionTitle>
        <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>

        <SectionTitle format={format} styles={styles}>
          今後のキャリアの方向性
        </SectionTitle>
        <Text style={styles.paragraph}>{resume.careerDirection || "（未入力）"}</Text>

        <SectionTitle format={format} styles={styles}>
          資格・免許
        </SectionTitle>
        {qualifications.length === 0 ? (
          <Text style={styles.emptyNote}>登録された資格はありません</Text>
        ) : (
          <Text style={styles.paragraph}>
            {qualifications
              .map((q) => `${q.name}${q.obtainedDate ? `（${formatYearMonth(q.obtainedDate)}）` : ""}`)
              .join("　/　")}
          </Text>
        )}
      </Page>
    </Document>
  );
}

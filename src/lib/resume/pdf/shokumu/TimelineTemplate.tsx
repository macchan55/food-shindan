import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "../types";
import { formatYearMonth, today } from "../format";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9, padding: 34, color: COLORS.ink },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 },
  title: { fontSize: 17, fontWeight: 700 },
  nameLine: { fontSize: 10, textAlign: "right" },
  dateLine: { fontSize: 8, color: COLORS.muted, marginBottom: 14, textAlign: "right" },
  summaryCard: {
    backgroundColor: COLORS.brandSoft,
    borderLeft: `3pt solid ${COLORS.brand}`,
    padding: 10,
    marginBottom: 16,
  },
  summaryLabel: { fontSize: 8, fontWeight: 700, color: COLORS.brand, marginBottom: 3 },
  summaryText: { fontSize: 9.5, lineHeight: 1.6 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 16, marginBottom: 8 },
  timelineRow: { flexDirection: "row" },
  timelineRail: { width: 16, flexDirection: "column", alignItems: "center" },
  timelineDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: COLORS.brand, marginTop: 3 },
  timelineLine: { width: 1.5, flexGrow: 1, backgroundColor: COLORS.brandBorder, marginTop: 2 },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 16 },
  timelinePeriod: { fontSize: 8, color: COLORS.muted, marginBottom: 2 },
  timelineHeader: { fontSize: 9.5, fontWeight: 700, marginBottom: 3 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 3 },
  tag: {
    fontSize: 7.5,
    color: COLORS.brand,
    border: `0.5pt solid ${COLORS.brandBorder}`,
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginTop: 2,
  },
  workLabel: { fontSize: 8.5, fontWeight: 700, marginTop: 3 },
  workText: { fontSize: 8.5, lineHeight: 1.5, marginTop: 1 },
  emptyNote: { fontSize: 8.5, color: COLORS.faint },
  paragraph: { fontSize: 9, lineHeight: 1.6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    fontSize: 7.5,
    color: "#333333",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginTop: 3,
  },
});

export function TimelineTemplate({ data }: { data: ResumePdfData }) {
  const { profile, workExperiences, qualifications, resume } = data;

  const sorted = [...workExperiences].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    const at = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bt = b.startDate ? new Date(b.startDate).getTime() : 0;
    return bt - at;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>職務経歴書</Text>
          <Text style={styles.nameLine}>{profile.fullName || "（未入力）"}</Text>
        </View>
        <Text style={styles.dateLine}>{today()}現在</Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>キャリアサマリー</Text>
          <Text style={styles.summaryText}>{resume.workSummary || "（未入力）"}</Text>
        </View>

        <Text style={styles.sectionTitle}>職務経歴（直近から）</Text>
        {sorted.length === 0 ? (
          <Text style={styles.emptyNote}>登録された職歴はありません</Text>
        ) : (
          sorted.map((w, i) => {
            const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" / ");
            const period = `${formatYearMonth(w.startDate)} 〜 ${
              w.isCurrent ? "現在" : formatYearMonth(w.endDate)
            }`;
            const tags = [w.employmentType, w.jobType, w.position].filter(Boolean) as string[];
            return (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot} />
                  {i < sorted.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelinePeriod}>{period}</Text>
                  <Text style={styles.timelineHeader}>{label}</Text>
                  {tags.length > 0 && (
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
              </View>
            );
          })
        )}

        <Text style={styles.sectionTitle}>自己PR</Text>
        <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>強み</Text>
        <Text style={styles.paragraph}>{resume.strengthsText || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>今後のキャリアの方向性</Text>
        <Text style={styles.paragraph}>{resume.careerDirection || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>資格・免許</Text>
        {qualifications.length === 0 ? (
          <Text style={styles.emptyNote}>登録された資格はありません</Text>
        ) : (
          <View style={styles.chipRow}>
            {qualifications.map((q, i) => (
              <Text key={i} style={styles.chip}>
                {q.name}
                {q.obtainedDate ? `（${formatYearMonth(q.obtainedDate)}）` : ""}
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

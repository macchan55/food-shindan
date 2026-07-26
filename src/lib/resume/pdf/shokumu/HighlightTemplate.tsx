import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "../types";
import { formatYearMonth, today } from "../format";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9, color: COLORS.ink, padding: 0 },
  headerBand: { backgroundColor: COLORS.brand, paddingVertical: 20, paddingHorizontal: 36 },
  title: { fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 4 },
  headerMetaRow: { flexDirection: "row", justifyContent: "space-between" },
  nameLine: { fontSize: 10, color: "#ffffff" },
  dateLine: { fontSize: 8, color: "#ffe3ec" },
  content: { padding: 30 },
  selfPrCard: {
    backgroundColor: "#fafafa",
    borderLeft: `3pt solid ${COLORS.brand}`,
    padding: 12,
    marginBottom: 16,
  },
  selfPrLabel: { fontSize: 8, fontWeight: 700, color: COLORS.brand, marginBottom: 4 },
  selfPrText: { fontSize: 9.5, lineHeight: 1.7 },
  sectionTitle: { fontSize: 11, fontWeight: 700, marginTop: 14, marginBottom: 8 },
  highlightRow: { flexDirection: "row", marginBottom: 10 },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  badgeText: { fontSize: 9, fontWeight: 700, color: "#ffffff" },
  highlightBody: { flex: 1 },
  highlightContext: { fontSize: 7.5, color: COLORS.muted, marginBottom: 2 },
  highlightText: { fontSize: 9, lineHeight: 1.5 },
  emptyNote: { fontSize: 8.5, color: COLORS.faint },
  paragraph: { fontSize: 9, lineHeight: 1.6 },
  table: { border: `0.5pt solid ${COLORS.border}`, marginTop: 4 },
  row: { flexDirection: "row", borderBottom: `0.5pt solid ${COLORS.border}` },
  cellPeriod: { width: 130, padding: 4, fontSize: 8, borderRight: `0.5pt solid ${COLORS.border}` },
  cellCompany: { flex: 1, padding: 4, fontSize: 8, borderRight: `0.5pt solid ${COLORS.border}` },
  cellRole: { width: 90, padding: 4, fontSize: 8 },
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

export function HighlightTemplate({ data }: { data: ResumePdfData }) {
  const { profile, workExperiences, qualifications, resume } = data;

  const highlights = workExperiences.filter((w) => w.achievements);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.title}>職務経歴書</Text>
          <View style={styles.headerMetaRow}>
            <Text style={styles.nameLine}>{profile.fullName || "（未入力）"}</Text>
            <Text style={styles.dateLine}>{today()}現在</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.selfPrCard}>
            <Text style={styles.selfPrLabel}>自己PR</Text>
            <Text style={styles.selfPrText}>{resume.selfPr || "（未入力）"}</Text>
          </View>

          <Text style={styles.sectionTitle}>実績ハイライト</Text>
          {highlights.length === 0 ? (
            <Text style={styles.emptyNote}>登録された実績はありません</Text>
          ) : (
            highlights.map((w, i) => {
              const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" / ");
              return (
                <View key={i} style={styles.highlightRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{i + 1}</Text>
                  </View>
                  <View style={styles.highlightBody}>
                    <Text style={styles.highlightContext}>
                      {label}
                      {w.position ? `　${w.position}` : ""}
                    </Text>
                    <Text style={styles.highlightText}>{w.achievements}</Text>
                  </View>
                </View>
              );
            })
          )}

          <Text style={styles.sectionTitle}>強み</Text>
          <Text style={styles.paragraph}>{resume.strengthsText || "（未入力）"}</Text>

          <Text style={styles.sectionTitle}>職務経歴</Text>
          {workExperiences.length === 0 ? (
            <Text style={styles.emptyNote}>登録された職歴はありません</Text>
          ) : (
            <View style={styles.table}>
              {workExperiences.map((w, i) => {
                const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" / ");
                const period = `${formatYearMonth(w.startDate)} 〜 ${
                  w.isCurrent ? "現在" : formatYearMonth(w.endDate)
                }`;
                return (
                  <View key={i} style={styles.row}>
                    <Text style={styles.cellPeriod}>{period}</Text>
                    <Text style={styles.cellCompany}>{label}</Text>
                    <Text style={styles.cellRole}>{w.position ?? ""}</Text>
                  </View>
                );
              })}
            </View>
          )}

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
        </View>
      </Page>
    </Document>
  );
}

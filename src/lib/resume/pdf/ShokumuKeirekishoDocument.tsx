import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "./types";
import { formatYearMonth, today } from "./format";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9, padding: 32, color: "#1a1a1a" },
  title: { fontSize: 16, textAlign: "center", marginBottom: 4, fontWeight: 700 },
  dateLine: { fontSize: 8, textAlign: "right", marginBottom: 4, color: "#555" },
  nameLine: { fontSize: 10, textAlign: "right", marginBottom: 10 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 4,
    borderBottom: "1pt solid #333",
    paddingBottom: 2,
  },
  paragraph: { fontSize: 9, lineHeight: 1.6 },
  workBlock: {
    marginTop: 8,
    padding: 8,
    border: "0.5pt solid #ccc",
  },
  workHeader: { fontSize: 9.5, fontWeight: 700, marginBottom: 2 },
  workMeta: { fontSize: 8, color: "#555", marginBottom: 4 },
  workLabel: { fontSize: 8.5, fontWeight: 700, marginTop: 3 },
  workText: { fontSize: 8.5, lineHeight: 1.5, marginTop: 1 },
  emptyNote: { fontSize: 8.5, color: "#999" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 2 },
  tag: {
    fontSize: 7.5,
    color: "#333",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
    marginTop: 3,
  },
});

export function ShokumuKeirekishoDocument({ data }: { data: ResumePdfData }) {
  const { profile, workExperiences, qualifications, resume } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>職務経歴書</Text>
        <Text style={styles.dateLine}>{today()}現在</Text>
        <Text style={styles.nameLine}>{profile.fullName || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>職務要約</Text>
        <Text style={styles.paragraph}>{resume.workSummary || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>職務経歴</Text>
        {workExperiences.length === 0 ? (
          <Text style={styles.emptyNote}>登録された職歴はありません</Text>
        ) : (
          workExperiences.map((w, i) => {
            const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" / ");
            const period = `${formatYearMonth(w.startDate)} 〜 ${
              w.isCurrent ? "現在" : formatYearMonth(w.endDate)
            }`;
            return (
              <View key={i} style={styles.workBlock}>
                <Text style={styles.workHeader}>{label}</Text>
                <Text style={styles.workMeta}>{period}</Text>
                <View style={styles.tagRow}>
                  {[w.employmentType, w.jobType, w.position].filter(Boolean).map((tag, j) => (
                    <Text key={j} style={styles.tag}>
                      {tag}
                    </Text>
                  ))}
                </View>
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

        <Text style={styles.sectionTitle}>強み</Text>
        <Text style={styles.paragraph}>{resume.strengthsText || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>自己PR</Text>
        <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>今後のキャリアの方向性</Text>
        <Text style={styles.paragraph}>{resume.careerDirection || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>資格・免許</Text>
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

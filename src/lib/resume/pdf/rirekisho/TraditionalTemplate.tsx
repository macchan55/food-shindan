import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "../types";
import { splitYearMonth, today } from "../format";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9, padding: 28, color: COLORS.ink },
  title: { fontSize: 16, textAlign: "center", marginBottom: 4, fontWeight: 700, letterSpacing: 4 },
  dateLine: { fontSize: 8, textAlign: "right", marginBottom: 8, color: COLORS.muted },
  headerRow: {
    flexDirection: "row",
    marginBottom: 12,
    borderBottom: `1pt solid ${COLORS.ink}`,
    paddingBottom: 8,
  },
  headerLeft: { flex: 1 },
  photoBox: {
    width: 76,
    height: 96,
    border: `1pt solid ${COLORS.faint}`,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: { width: 76, height: 96, objectFit: "cover" },
  photoPlaceholder: { fontSize: 7, color: COLORS.faint, textAlign: "center", padding: 4 },
  kana: { fontSize: 7, color: COLORS.muted, marginBottom: 1 },
  name: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  metaLine: { fontSize: 8.5, marginBottom: 3, color: "#333333" },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 4,
    borderBottom: `1pt solid ${COLORS.ink}`,
    paddingBottom: 2,
  },
  table: { border: `0.7pt solid ${COLORS.ink}` },
  tableHeadRow: { flexDirection: "row", borderBottom: `0.7pt solid ${COLORS.ink}`, backgroundColor: "#f5f5f5" },
  headYear: {
    width: 55,
    padding: 3,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    borderRight: `0.7pt solid ${COLORS.ink}`,
  },
  headMonth: {
    width: 35,
    padding: 3,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    borderRight: `0.7pt solid ${COLORS.ink}`,
  },
  headBody: { flex: 1, padding: 3, fontSize: 8, fontWeight: 700, textAlign: "center" },
  row: { flexDirection: "row", borderBottom: `0.5pt solid ${COLORS.border}`, minHeight: 18 },
  cellYear: {
    width: 55,
    padding: 3,
    fontSize: 8.5,
    textAlign: "center",
    borderRight: `0.5pt solid ${COLORS.border}`,
  },
  cellMonth: {
    width: 35,
    padding: 3,
    fontSize: 8.5,
    textAlign: "center",
    borderRight: `0.5pt solid ${COLORS.border}`,
  },
  cellBody: { flex: 1, padding: 3, fontSize: 8.5 },
  sectionRow: {
    borderBottom: `0.5pt solid ${COLORS.border}`,
    minHeight: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  sectionRowText: { fontSize: 8.5, fontWeight: 700 },
  finalRow: { textAlign: "right", fontSize: 9, marginTop: 3, paddingRight: 4 },
  emptyNote: { fontSize: 8.5, color: COLORS.faint, padding: 4 },
  splitRow: { flexDirection: "row", marginTop: 12 },
  splitBox: { flex: 1, border: `0.7pt solid ${COLORS.border}`, padding: 8 },
  splitLabel: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
    borderBottom: `0.5pt solid ${COLORS.border}`,
    paddingBottom: 2,
  },
  paragraph: { fontSize: 8.5, lineHeight: 1.6 },
});

type Row =
  | { kind: "section"; label: string }
  | { kind: "entry"; year: string; month: string; body: string };

export function TraditionalTemplate({ data }: { data: ResumePdfData }) {
  const { profile, education, workExperiences, qualifications, resume } = data;

  const rows: Row[] = [];
  if (education.length > 0 || workExperiences.length > 0) {
    rows.push({ kind: "section", label: "学歴" });
    for (const e of education) {
      if (e.admissionDate) {
        const { year, month } = splitYearMonth(e.admissionDate);
        rows.push({
          kind: "entry",
          year,
          month,
          body: `${e.schoolName}${e.department ? " " + e.department : ""} 入学`,
        });
      }
      const { year, month } = splitYearMonth(e.graduationDate);
      const statusLabel =
        e.status === "graduated" ? "卒業" : e.status === "withdrew" ? "中途退学" : "在学中";
      rows.push({
        kind: "entry",
        year,
        month,
        body: `${e.schoolName}${e.department ? " " + e.department : ""} ${statusLabel}`,
      });
    }
    rows.push({ kind: "section", label: "職歴" });
    for (const w of workExperiences) {
      const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" ");
      const start = splitYearMonth(w.startDate);
      rows.push({ kind: "entry", year: start.year, month: start.month, body: `${label} 入社` });
      if (w.isCurrent) {
        rows.push({ kind: "entry", year: "", month: "", body: "現在に至る" });
      } else {
        const end = splitYearMonth(w.endDate);
        rows.push({ kind: "entry", year: end.year, month: end.month, body: "退職" });
      }
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
      <Text style={styles.title}>履歴書</Text>
      <Text style={styles.dateLine}>{today()}現在</Text>

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.kana}>{profile.fullNameKana}</Text>
          <Text style={styles.name}>{profile.fullName || "（未入力）"}</Text>
          {profile.birthdate && (
            <Text style={styles.metaLine}>生年月日: {splitYearMonth(profile.birthdate).year}年{splitYearMonth(profile.birthdate).month}月</Text>
          )}
          {profile.gender && <Text style={styles.metaLine}>性別: {profile.gender}</Text>}
          <Text style={styles.metaLine}>住所: {profile.address || "（未入力）"}</Text>
          <Text style={styles.metaLine}>電話: {profile.phone || "（未入力）"}</Text>
          <Text style={styles.metaLine}>メール: {data.email}</Text>
        </View>
        <View style={styles.photoBox}>
          {profile.photoUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={profile.photoUrl} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>写真</Text>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>学歴・職歴</Text>
      <View style={styles.table}>
        <View style={styles.tableHeadRow}>
          <Text style={styles.headYear}>年</Text>
          <Text style={styles.headMonth}>月</Text>
          <Text style={styles.headBody}>学歴・職歴</Text>
        </View>
        {rows.length === 0 ? (
          <Text style={styles.emptyNote}>登録された学歴・職歴はありません</Text>
        ) : (
          rows.map((r, i) =>
            r.kind === "section" ? (
              <View key={i} style={styles.sectionRow}>
                <Text style={styles.sectionRowText}>{r.label}</Text>
              </View>
            ) : (
              <View key={i} style={styles.row}>
                <Text style={styles.cellYear}>{r.year}</Text>
                <Text style={styles.cellMonth}>{r.month}</Text>
                <Text style={styles.cellBody}>{r.body}</Text>
              </View>
            )
          )
        )}
      </View>
      {rows.length > 0 && <Text style={styles.finalRow}>以上</Text>}

      <Text style={styles.sectionTitle}>資格・免許</Text>
      <View style={styles.table}>
        <View style={styles.tableHeadRow}>
          <Text style={styles.headYear}>年</Text>
          <Text style={styles.headMonth}>月</Text>
          <Text style={styles.headBody}>資格・免許</Text>
        </View>
        {qualifications.length === 0 ? (
          <Text style={styles.emptyNote}>登録された資格はありません</Text>
        ) : (
          qualifications.map((q, i) => {
            const { year, month } = splitYearMonth(q.obtainedDate);
            return (
              <View key={i} style={styles.row}>
                <Text style={styles.cellYear}>{year}</Text>
                <Text style={styles.cellMonth}>{month}</Text>
                <Text style={styles.cellBody}>
                  {q.name}
                  {q.issuer ? `（${q.issuer}）` : ""}
                </Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.splitRow}>
        <View style={[styles.splitBox, { marginRight: 8 }]}>
          <Text style={styles.splitLabel}>自己PR</Text>
          <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>
        </View>
        <View style={styles.splitBox}>
          <Text style={styles.splitLabel}>志望動機</Text>
          <Text style={styles.paragraph}>{resume.motivation || "（未入力）"}</Text>
        </View>
      </View>
      </Page>
    </Document>
  );
}

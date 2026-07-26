import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "./types";
import { formatYearMonth, today } from "./format";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9, padding: 28, color: "#1a1a1a" },
  title: { fontSize: 16, textAlign: "center", marginBottom: 4, fontWeight: 700 },
  dateLine: { fontSize: 8, textAlign: "right", marginBottom: 8, color: "#555" },
  headerRow: { flexDirection: "row", marginBottom: 10 },
  headerLeft: { flex: 1 },
  photoBox: {
    width: 76,
    height: 96,
    border: "1pt solid #999",
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: { width: 76, height: 96, objectFit: "cover" },
  photoPlaceholder: { fontSize: 7, color: "#999", textAlign: "center", padding: 4 },
  kana: { fontSize: 7, color: "#666", marginBottom: 1 },
  name: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  metaLine: { fontSize: 8.5, marginBottom: 3, color: "#333" },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 4,
    borderBottom: "1pt solid #333",
    paddingBottom: 2,
  },
  table: { border: "0.5pt solid #ccc" },
  row: { flexDirection: "row", borderBottom: "0.5pt solid #ccc" },
  cellDate: { width: 70, padding: 4, fontSize: 8.5, borderRight: "0.5pt solid #ccc" },
  cellBody: { flex: 1, padding: 4, fontSize: 8.5 },
  emptyNote: { fontSize: 8.5, color: "#999", padding: 4 },
  paragraph: { fontSize: 9, lineHeight: 1.6, marginTop: 2 },
});

function Table({
  rows,
}: {
  rows: { date: string; body: string }[];
}) {
  if (rows.length === 0) {
    return (
      <View style={styles.table}>
        <Text style={styles.emptyNote}>登録された情報はありません</Text>
      </View>
    );
  }
  return (
    <View style={styles.table}>
      {rows.map((r, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.cellDate}>{r.date}</Text>
          <Text style={styles.cellBody}>{r.body}</Text>
        </View>
      ))}
    </View>
  );
}

export function RirekishoDocument({ data }: { data: ResumePdfData }) {
  const { profile, education, workExperiences, qualifications, resume } = data;

  const educationRows = education.map((e) => ({
    date: formatYearMonth(e.graduationDate),
    body: `${e.schoolName}${e.department ? " " + e.department : ""} ${
      e.status === "graduated" ? "卒業" : e.status === "withdrew" ? "中退" : "在学中"
    }`,
  }));

  const workRows = workExperiences.flatMap((w) => {
    const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" ");
    const entries = [{ date: formatYearMonth(w.startDate), body: `${label} 入社` }];
    if (!w.isCurrent) {
      entries.push({ date: formatYearMonth(w.endDate), body: "退職" });
    }
    return entries;
  });

  const qualificationRows = qualifications.map((q) => ({
    date: formatYearMonth(q.obtainedDate),
    body: `${q.name}${q.issuer ? "（" + q.issuer + "）" : ""}`,
  }));

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
              <Text style={styles.metaLine}>生年月日: {formatYearMonth(profile.birthdate)}</Text>
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

        <Text style={styles.sectionTitle}>学歴</Text>
        <Table rows={educationRows} />

        <Text style={styles.sectionTitle}>職歴</Text>
        <Table rows={workRows} />

        <Text style={styles.sectionTitle}>資格・免許</Text>
        <Table rows={qualificationRows} />

        <Text style={styles.sectionTitle}>自己PR</Text>
        <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>

        <Text style={styles.sectionTitle}>志望動機</Text>
        <Text style={styles.paragraph}>{resume.motivation || "（未入力）"}</Text>
      </Page>
    </Document>
  );
}

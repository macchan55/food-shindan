import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "../types";
import { formatYearMonth, today } from "../format";
import { COLORS } from "../theme";

const SIDEBAR_WIDTH = 170;

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9, color: COLORS.ink },
  sidebarBg: { position: "absolute", top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: COLORS.sidebarBg },
  root: { flexDirection: "row", flexGrow: 1 },
  sidebar: { width: SIDEBAR_WIDTH, padding: 20, alignItems: "center" },
  photoBox: {
    width: 84,
    height: 106,
    border: "1.5pt solid #ffffff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#544450",
    marginBottom: 12,
  },
  photo: { width: 84, height: 106, objectFit: "cover" },
  photoPlaceholder: { fontSize: 7, color: "#d8cdd4", textAlign: "center" },
  kana: { fontSize: 7, color: "#cbb9c3", marginBottom: 2, textAlign: "center" },
  name: { fontSize: 14, fontWeight: 700, color: "#ffffff", marginBottom: 14, textAlign: "center" },
  contactLabel: { fontSize: 7, color: "#cbb9c3", marginTop: 8 },
  contactValue: { fontSize: 8.5, color: "#ffffff", lineHeight: 1.5 },
  sidebarDivider: { height: 1, backgroundColor: "#5c4c58", width: "100%", marginTop: 16, marginBottom: 4 },
  sidebarSectionTitle: { fontSize: 8.5, fontWeight: 700, color: COLORS.brandSoft, marginTop: 14, marginBottom: 6 },
  qualificationLine: { fontSize: 8, color: "#ffffff", marginBottom: 4, lineHeight: 1.4 },
  main: { flex: 1, padding: 28 },
  title: { fontSize: 17, fontWeight: 700, color: COLORS.ink, marginBottom: 2 },
  dateLine: { fontSize: 8, color: COLORS.muted, marginBottom: 16 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    color: COLORS.brand,
    marginTop: 14,
    marginBottom: 6,
    borderBottom: `1.2pt solid ${COLORS.brandBorder}`,
    paddingBottom: 3,
  },
  listItem: { marginBottom: 6 },
  listItemDate: { fontSize: 8, color: COLORS.muted, marginBottom: 1 },
  listItemBody: { fontSize: 9, lineHeight: 1.4 },
  emptyNote: { fontSize: 9, color: COLORS.faint },
  paragraph: { fontSize: 9, lineHeight: 1.7 },
});

export function SidebarTemplate({ data }: { data: ResumePdfData }) {
  const { profile, education, workExperiences, qualifications, resume } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.sidebarBg} fixed />
        <View style={styles.root}>
          <View style={styles.sidebar}>
            <View style={styles.photoBox}>
              {profile.photoUrl ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={profile.photoUrl} style={styles.photo} />
              ) : (
                <Text style={styles.photoPlaceholder}>PHOTO</Text>
              )}
            </View>
            <Text style={styles.kana}>{profile.fullNameKana}</Text>
            <Text style={styles.name}>{profile.fullName || "（未入力）"}</Text>

            <View style={{ width: "100%" }}>
              <Text style={styles.contactLabel}>住所</Text>
              <Text style={styles.contactValue}>{profile.address || "（未入力）"}</Text>
              <Text style={styles.contactLabel}>電話</Text>
              <Text style={styles.contactValue}>{profile.phone || "（未入力）"}</Text>
              <Text style={styles.contactLabel}>メール</Text>
              <Text style={styles.contactValue}>{data.email}</Text>
              {profile.birthdate && (
                <>
                  <Text style={styles.contactLabel}>生年月日</Text>
                  <Text style={styles.contactValue}>{formatYearMonth(profile.birthdate)}</Text>
                </>
              )}
            </View>

            <View style={styles.sidebarDivider} />
            <Text style={styles.sidebarSectionTitle}>資格・免許</Text>
            {qualifications.length === 0 ? (
              <Text style={styles.qualificationLine}>登録なし</Text>
            ) : (
              qualifications.map((q, i) => (
                <Text key={i} style={styles.qualificationLine}>
                  ・{q.name}
                </Text>
              ))
            )}
          </View>

          <View style={styles.main}>
            <Text style={styles.title}>履歴書</Text>
            <Text style={styles.dateLine}>{today()}現在</Text>

            <Text style={styles.sectionTitle}>学歴</Text>
            {education.length === 0 ? (
              <Text style={styles.emptyNote}>登録された学歴はありません</Text>
            ) : (
              education.map((e, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listItemDate}>{formatYearMonth(e.graduationDate)}</Text>
                  <Text style={styles.listItemBody}>
                    {e.schoolName}
                    {e.department ? `　${e.department}` : ""}
                    {e.status === "graduated" ? "卒業" : e.status === "withdrew" ? "中途退学" : "在学中"}
                  </Text>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>職歴</Text>
            {workExperiences.length === 0 ? (
              <Text style={styles.emptyNote}>登録された職歴はありません</Text>
            ) : (
              workExperiences.map((w, i) => {
                const label = [w.companyName, w.brandName, w.storeName].filter(Boolean).join(" / ");
                const period = `${formatYearMonth(w.startDate)} - ${
                  w.isCurrent ? "現在" : formatYearMonth(w.endDate)
                }`;
                return (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listItemDate}>{period}</Text>
                    <Text style={styles.listItemBody}>
                      {label}
                      {w.position ? `　${w.position}` : ""}
                    </Text>
                  </View>
                );
              })
            )}

            <Text style={styles.sectionTitle}>自己PR</Text>
            <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>

            <Text style={styles.sectionTitle}>志望動機</Text>
            <Text style={styles.paragraph}>{resume.motivation || "（未入力）"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

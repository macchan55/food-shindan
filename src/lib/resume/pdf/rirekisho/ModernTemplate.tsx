import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { ResumePdfData } from "../types";
import { formatYearMonth, today } from "../format";
import { COLORS } from "../theme";

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansJP", fontSize: 9.5, padding: 40, color: COLORS.ink },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kana: { fontSize: 8, color: COLORS.muted, letterSpacing: 1, marginBottom: 3 },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 10 },
  metaBlock: { marginTop: 2 },
  metaLine: { fontSize: 9, color: "#333333", marginBottom: 2, lineHeight: 1.5 },
  photo: { width: 68, height: 88, objectFit: "cover", borderRadius: 2 },
  photoBox: {
    width: 68,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 2,
  },
  photoPlaceholder: { fontSize: 7, color: COLORS.faint },
  dateLine: { fontSize: 8, color: COLORS.muted, marginTop: 14, marginBottom: 4 },
  divider: { height: 1, backgroundColor: "#e5e5e5", marginTop: 4, marginBottom: 18 },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sectionBar: { width: 3, height: 12, backgroundColor: COLORS.ink, marginRight: 6 },
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 1 },
  listItem: { marginBottom: 7 },
  listItemDate: { fontSize: 8, color: COLORS.muted, marginBottom: 1 },
  listItemBody: { fontSize: 9.5, lineHeight: 1.4 },
  emptyNote: { fontSize: 9, color: COLORS.faint },
  tagRow: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    fontSize: 8,
    color: "#333333",
    marginRight: 14,
    marginBottom: 4,
  },
  paragraphBlock: { backgroundColor: "#fafafa", borderRadius: 4, padding: 12, marginBottom: 4 },
  paragraph: { fontSize: 9.5, lineHeight: 1.7, color: "#2a2a2a" },
});

export function ModernTemplate({ data }: { data: ResumePdfData }) {
  const { profile, education, workExperiences, qualifications, resume } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kana}>{profile.fullNameKana}</Text>
            <Text style={styles.name}>{profile.fullName || "（未入力）"}</Text>
            <View style={styles.metaBlock}>
              {profile.birthdate && (
                <Text style={styles.metaLine}>生年月日　{formatYearMonth(profile.birthdate)}</Text>
              )}
              {profile.gender && <Text style={styles.metaLine}>性別　{profile.gender}</Text>}
              <Text style={styles.metaLine}>住所　{profile.address || "（未入力）"}</Text>
              <Text style={styles.metaLine}>
                {profile.phone || "（未入力）"}　　{data.email}
              </Text>
            </View>
          </View>
          <View style={styles.photoBox}>
            {profile.photoUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={profile.photoUrl} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>PHOTO</Text>
            )}
          </View>
        </View>
        <Text style={styles.dateLine}>{today()}現在</Text>
        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>学歴</Text>
          </View>
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>職歴</Text>
          </View>
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
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>資格・免許</Text>
          </View>
          {qualifications.length === 0 ? (
            <Text style={styles.emptyNote}>登録された資格はありません</Text>
          ) : (
            <View style={styles.tagRow}>
              {qualifications.map((q, i) => (
                <Text key={i} style={styles.tag}>
                  {q.name}
                  {q.obtainedDate ? `（${formatYearMonth(q.obtainedDate)}）` : ""}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>自己PR</Text>
          </View>
          <View style={styles.paragraphBlock}>
            <Text style={styles.paragraph}>{resume.selfPr || "（未入力）"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>志望動機</Text>
          </View>
          <View style={styles.paragraphBlock}>
            <Text style={styles.paragraph}>{resume.motivation || "（未入力）"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

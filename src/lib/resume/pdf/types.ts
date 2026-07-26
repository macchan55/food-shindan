export type ResumeFormat = "simple" | "standard" | "rich";

export type ResumePdfData = {
  email: string;
  profile: {
    fullName: string;
    fullNameKana: string;
    birthdate: string | null;
    gender: string | null;
    address: string;
    phone: string;
    photoUrl: string | null;
  };
  education: {
    schoolType: string;
    schoolName: string;
    department: string | null;
    graduationDate: string | null;
    status: "graduated" | "withdrew" | "enrolled";
  }[];
  workExperiences: {
    companyName: string;
    brandName: string | null;
    storeName: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    employmentType: string | null;
    jobType: string | null;
    position: string | null;
    mainDuties: string | null;
    achievements: string | null;
  }[];
  qualifications: {
    name: string;
    issuer: string | null;
    obtainedDate: string | null;
  }[];
  resume: {
    workSummary: string | null;
    selfPr: string | null;
    strengthsText: string | null;
    motivation: string | null;
    careerDirection: string | null;
  };
};

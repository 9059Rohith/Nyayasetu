import departmentsData from "@/data/departments.json";
import type { Department, SubjectCategory } from "@/types/domain";

export const departments = departmentsData as Department[];

const KEYWORDS: Record<SubjectCategory, string[]> = {
  roads_infrastructure: ["road", "pothole", "bridge", "contractor", "सड़क", "गड्ढ"],
  municipal_sanitation: ["garbage", "waste", "drain", "sanitation", "कचरा", "नाली"],
  electricity_utility: ["streetlight", "electric", "power", "meter", "बिजली", "लाइट"],
  land_revenue: ["land", "property", "mutation", "revenue", "registry", "भूमि", "जमीन"],
  police_conduct: ["police", "fir", "station", "complaint diary", "पुलिस"],
  education_scheme: ["school", "college", "scholarship", "teacher", "शिक्षा", "छात्रवृत्ति"],
  healthcare_scheme: ["hospital", "health", "medical", "clinic", "स्वास्थ्य", "अस्पताल"],
  welfare_pension: ["pension", "welfare", "ration", "benefit", "पेंशन", "कल्याण"],
  other: [],
};

export function detectCategory(raw: string): { category: SubjectCategory; matches: number } {
  const text = raw.toLocaleLowerCase();
  let best: SubjectCategory = "other";
  let bestScore = 0;
  for (const category of Object.keys(KEYWORDS) as SubjectCategory[]) {
    const score = KEYWORDS[category].reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return { category: best, matches: bestScore };
}

export function chooseDepartment(category: SubjectCategory, pinCode: string | null): Department {
  const candidates = departments.filter((department) => department.subject_tags.includes(category));
  if (pinCode) {
    const prefix = pinCode.slice(0, 3);
    const exact = candidates.find((department) => department.pin_code_prefixes.includes(prefix));
    if (exact) return exact;
  }
  return candidates[0] ?? departments.find((department) => department.id === "dept_general_records")!;
}

export function getDepartment(id: string): Department {
  return departments.find((department) => department.id === id) ?? departments.find((department) => department.id === "dept_general_records")!;
}

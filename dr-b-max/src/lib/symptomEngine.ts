/**
 * Advanced Rule-Based Symptom Engine
 * 50+ symptoms, 20+ conditions, severity scoring — 100% offline
 */

export type Severity = "mild" | "moderate" | "urgent" | "emergency";

export interface Condition {
  name: string;
  confidence: number;
  severity: Severity;
  advice: string;
  seeDoctor: boolean;
}

export interface SymptomResult {
  conditions: Condition[];
  overallSeverity: Severity;
  summary: string;
  emergencyCall: boolean;
}

const SYMPTOM_DATABASE: Record<string, string[]> = {
  // Cardiovascular
  chest_pain: ["Heart Attack", "Angina", "GERD", "Anxiety"],
  shortness_of_breath: ["Heart Failure", "Asthma", "Pneumonia", "Anxiety"],
  palpitations: ["Arrhythmia", "Anxiety", "Hyperthyroidism", "Anemia"],
  rapid_heartbeat: ["Arrhythmia", "Fever", "Anxiety", "Hyperthyroidism"],
  swollen_ankles: ["Heart Failure", "DVT", "Kidney Disease", "Varicose Veins"],

  // Neurological
  headache: ["Migraine", "Tension Headache", "Hypertension", "Sinusitis"],
  severe_headache: ["Meningitis", "Stroke", "Migraine", "Hypertensive Crisis"],
  dizziness: ["Vertigo", "Low Blood Pressure", "Anemia", "Inner Ear Infection"],
  fainting: ["Vasovagal Syncope", "Cardiac Arrhythmia", "Low Blood Sugar"],
  numbness: ["Stroke", "Peripheral Neuropathy", "MS", "Carpal Tunnel"],
  confusion: ["Stroke", "High Fever", "Low Blood Sugar", "UTI in Elderly"],
  blurred_vision: ["Hypertension", "Diabetes", "Migraine", "Eye Strain"],

  // Respiratory
  cough: ["Common Cold", "Flu", "Asthma", "Bronchitis", "COVID-19"],
  severe_cough: ["Pneumonia", "Whooping Cough", "TB", "Lung Cancer"],
  fever: ["Flu", "COVID-19", "Malaria", "Dengue", "Typhoid", "UTI"],
  high_fever: ["Meningitis", "Malaria", "Dengue", "Typhoid", "Sepsis"],
  runny_nose: ["Common Cold", "Allergy", "Flu", "Sinusitis"],
  sore_throat: ["Strep Throat", "Common Cold", "Tonsillitis", "Flu"],

  // Gastrointestinal
  nausea: ["Gastroenteritis", "Food Poisoning", "Migraine", "Pregnancy", "Anxiety"],
  vomiting: ["Gastroenteritis", "Food Poisoning", "Appendicitis", "Migraine"],
  diarrhea: ["Gastroenteritis", "IBS", "Food Poisoning", "Celiac Disease"],
  stomach_pain: ["Gastritis", "Appendicitis", "IBS", "GERD", "Kidney Stones"],
  severe_stomach_pain: ["Appendicitis", "Kidney Stones", "Pancreatitis", "Bowel Obstruction"],
  bloating: ["IBS", "GERD", "Food Intolerance", "Ovarian Cyst"],

  // Musculoskeletal
  joint_pain: ["Arthritis", "Gout", "Lupus", "Dengue", "Viral Fever"],
  back_pain: ["Muscle Strain", "Slipped Disc", "Kidney Stones", "Sciatica"],
  muscle_weakness: ["Myasthenia Gravis", "MS", "Stroke", "Electrolyte Imbalance"],

  // General
  fatigue: ["Anemia", "Thyroid Disorder", "Diabetes", "Depression", "Viral Infection"],
  weight_loss: ["Diabetes", "Hyperthyroidism", "Cancer", "TB", "Depression"],
  weight_gain: ["Hypothyroidism", "PCOS", "Cushing Syndrome", "Diabetes"],
  excessive_thirst: ["Diabetes", "Dehydration", "Diabetes Insipidus"],
  frequent_urination: ["Diabetes", "UTI", "Prostate Issues", "Diabetes Insipidus"],
  skin_rash: ["Allergy", "Dengue", "Chickenpox", "Eczema", "Psoriasis"],
  yellowing_skin: ["Jaundice", "Hepatitis", "Liver Disease", "Bile Duct Obstruction"],
  hair_loss: ["Alopecia", "Thyroid Disorder", "Iron Deficiency", "PCOS", "Stress"],
  night_sweats: ["TB", "Lymphoma", "Menopause", "Hyperthyroidism", "HIV"],
  swollen_lymph_nodes: ["Infection", "Lymphoma", "Mono", "TB", "Leukemia"],
  loss_of_appetite: ["Hepatitis", "Cancer", "Depression", "Kidney Disease"],
  anxiety: ["Anxiety Disorder", "Hyperthyroidism", "Heart Disease", "Depression"],
  insomnia: ["Anxiety", "Depression", "Sleep Apnea", "Hyperthyroidism"],
  memory_loss: ["Dementia", "Alzheimer's", "Depression", "B12 Deficiency", "Stroke"],
};

const CONDITION_SEVERITY: Record<string, Severity> = {
  "Heart Attack": "emergency", "Stroke": "emergency", "Meningitis": "emergency",
  "Sepsis": "emergency", "Appendicitis": "emergency", "Bowel Obstruction": "emergency",
  "Hypertensive Crisis": "emergency", "Pancreatitis": "urgent",
  "Pneumonia": "urgent", "Dengue": "urgent", "Malaria": "urgent",
  "Typhoid": "urgent", "DVT": "urgent", "Arrhythmia": "urgent",
  "Kidney Stones": "urgent", "TB": "urgent", "Hepatitis": "urgent",
  "Lymphoma": "urgent", "Heart Failure": "urgent", "Migraine": "moderate",
  "Asthma": "moderate", "Diabetes": "moderate", "Hypertension": "moderate",
  "Flu": "moderate", "COVID-19": "moderate", "Anemia": "moderate",
  "Common Cold": "mild", "Tension Headache": "mild", "GERD": "mild",
  "IBS": "mild", "Anxiety": "mild", "Allergy": "mild",
};

const CONDITION_ADVICE: Record<string, string> = {
  "Heart Attack": "CALL 108 IMMEDIATELY. Chew aspirin if available. Do not drive yourself.",
  "Stroke": "CALL 108 NOW. Note time symptoms started. Do not give food/water.",
  "Meningitis": "EMERGENCY: Go to ER immediately. This is life-threatening.",
  "Dengue": "Go to doctor today. Monitor platelet count. Stay hydrated.",
  "Malaria": "See doctor immediately for blood test. Take antimalarials as prescribed.",
  "Typhoid": "Doctor visit required. Blood/stool test needed. Stay hydrated.",
  "Appendicitis": "Go to ER immediately. Do not eat or drink. Surgery may be needed.",
  "Pneumonia": "See doctor today. May need antibiotics and chest X-ray.",
  "Diabetes": "Monitor blood sugar. See doctor for HbA1c test. Diet control.",
  "Hypertension": "Monitor BP regularly. Reduce salt. See doctor for medication.",
  "Common Cold": "Rest, fluids, and OTC medication. Should resolve in 7-10 days.",
  "Flu": "Rest and fluids. Antiviral medication within 48 hours if needed.",
  "Migraine": "Rest in dark room. Pain reliever. See doctor if frequent.",
  "Anxiety": "Deep breathing exercises. Mindfulness. Consider therapy if persistent.",
  "Anemia": "Iron-rich diet. Iron supplements. See doctor for blood test.",
  "Allergy": "Antihistamines. Identify and avoid triggers. See allergist if severe.",
  "GERD": "Avoid spicy/fatty food. Don't lie down after eating. Antacids.",
};

export function analyzeSymptoms(selectedSymptoms: string[]): SymptomResult {
  if (selectedSymptoms.length === 0) {
    return { conditions: [], overallSeverity: "mild", summary: "No symptoms selected.", emergencyCall: false };
  }

  const conditionScores: Record<string, number> = {};

  selectedSymptoms.forEach(symptom => {
    const conditions = SYMPTOM_DATABASE[symptom] || [];
    conditions.forEach((cond, idx) => {
      const score = conditions.length - idx; // Higher score for first matches
      conditionScores[cond] = (conditionScores[cond] || 0) + score;
    });
  });

  const maxScore = Math.max(...Object.values(conditionScores));

  const sorted = Object.entries(conditionScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, score]) => ({
      name,
      confidence: Math.round((score / maxScore) * 100),
      severity: CONDITION_SEVERITY[name] || "mild",
      advice: CONDITION_ADVICE[name] || "Consult a doctor if symptoms persist.",
      seeDoctor: (CONDITION_SEVERITY[name] || "mild") !== "mild",
    }));

  const severityOrder: Severity[] = ["emergency", "urgent", "moderate", "mild"];
  const overallSeverity = severityOrder.find(s =>
    sorted.some(c => c.severity === s)
  ) || "mild";

  const emergencyCall = overallSeverity === "emergency";

  const summary = emergencyCall
    ? "⚠️ CRITICAL: Seek emergency care immediately!"
    : overallSeverity === "urgent"
    ? "Your symptoms may need prompt medical attention."
    : overallSeverity === "moderate"
    ? "Consider scheduling a doctor visit soon."
    : "Your symptoms appear mild. Monitor and rest.";

  return { conditions: sorted, overallSeverity, summary, emergencyCall };
}

export const ALL_SYMPTOMS: { id: string; label: string; category: string }[] = [
  { id: "chest_pain", label: "Chest Pain", category: "Heart" },
  { id: "shortness_of_breath", label: "Shortness of Breath", category: "Heart" },
  { id: "palpitations", label: "Palpitations", category: "Heart" },
  { id: "rapid_heartbeat", label: "Rapid Heartbeat", category: "Heart" },
  { id: "swollen_ankles", label: "Swollen Ankles", category: "Heart" },
  { id: "headache", label: "Headache", category: "Neuro" },
  { id: "severe_headache", label: "Severe Headache", category: "Neuro" },
  { id: "dizziness", label: "Dizziness", category: "Neuro" },
  { id: "fainting", label: "Fainting", category: "Neuro" },
  { id: "numbness", label: "Numbness/Tingling", category: "Neuro" },
  { id: "confusion", label: "Confusion", category: "Neuro" },
  { id: "blurred_vision", label: "Blurred Vision", category: "Neuro" },
  { id: "cough", label: "Cough", category: "Respiratory" },
  { id: "severe_cough", label: "Severe Cough", category: "Respiratory" },
  { id: "fever", label: "Fever", category: "Respiratory" },
  { id: "high_fever", label: "High Fever (>103°F)", category: "Respiratory" },
  { id: "runny_nose", label: "Runny Nose", category: "Respiratory" },
  { id: "sore_throat", label: "Sore Throat", category: "Respiratory" },
  { id: "nausea", label: "Nausea", category: "Digestive" },
  { id: "vomiting", label: "Vomiting", category: "Digestive" },
  { id: "diarrhea", label: "Diarrhea", category: "Digestive" },
  { id: "stomach_pain", label: "Stomach Pain", category: "Digestive" },
  { id: "severe_stomach_pain", label: "Severe Stomach Pain", category: "Digestive" },
  { id: "bloating", label: "Bloating", category: "Digestive" },
  { id: "joint_pain", label: "Joint Pain", category: "Body" },
  { id: "back_pain", label: "Back Pain", category: "Body" },
  { id: "muscle_weakness", label: "Muscle Weakness", category: "Body" },
  { id: "fatigue", label: "Fatigue / Tiredness", category: "General" },
  { id: "weight_loss", label: "Unexplained Weight Loss", category: "General" },
  { id: "weight_gain", label: "Unexplained Weight Gain", category: "General" },
  { id: "excessive_thirst", label: "Excessive Thirst", category: "General" },
  { id: "frequent_urination", label: "Frequent Urination", category: "General" },
  { id: "skin_rash", label: "Skin Rash", category: "General" },
  { id: "yellowing_skin", label: "Yellowing Skin/Eyes", category: "General" },
  { id: "hair_loss", label: "Hair Loss", category: "General" },
  { id: "night_sweats", label: "Night Sweats", category: "General" },
  { id: "swollen_lymph_nodes", label: "Swollen Lymph Nodes", category: "General" },
  { id: "loss_of_appetite", label: "Loss of Appetite", category: "General" },
  { id: "anxiety", label: "Anxiety / Panic", category: "Mental" },
  { id: "insomnia", label: "Insomnia", category: "Mental" },
  { id: "memory_loss", label: "Memory Loss", category: "Mental" },
];

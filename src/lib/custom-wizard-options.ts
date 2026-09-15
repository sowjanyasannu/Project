export const UNIFORM_TYPES = [
  "School Uniform",
  "Corporate Uniform",
  "Industrial Uniform",
  "Security Uniform",
  "Hospital Uniform",
  "Hotel Uniform",
  "Sports Uniform",
  "Custom Sports Jersey",
  "Other",
] as const;

export function uniformCategoryGroup(uniformType: string): "School Uniform" | "Sports Uniform" | "Corporate Uniform" | "Hospital Uniform" | "Hotel Uniform" | "Industrial Uniform" | "Security Uniform" {
  if (uniformType === "School Uniform") return "School Uniform";
  if (uniformType === "Sports Uniform" || uniformType === "Custom Sports Jersey") return "Sports Uniform";
  if (uniformType === "Hospital Uniform") return "Hospital Uniform";
  if (uniformType === "Hotel Uniform") return "Hotel Uniform";
  if (uniformType === "Industrial Uniform") return "Industrial Uniform";
  if (uniformType === "Security Uniform") return "Security Uniform";
  return "Corporate Uniform";
}

export function wearerOptions(uniformType: string): string[] {
  if (uniformType === "School Uniform") return ["Boys", "Girls", "Both"];
  if (uniformType === "Sports Uniform" || uniformType === "Custom Sports Jersey") {
    return ["Men", "Women", "Boys", "Girls", "Mixed"];
  }
  return ["Male", "Female", "Unisex"];
}

export function matrixColumns(uniformType: string, wearerType: string): string[] {
  if (uniformType === "School Uniform" && wearerType === "Both") return ["Boys", "Girls"];
  if (
    (uniformType === "Sports Uniform" || uniformType === "Custom Sports Jersey") &&
    wearerType === "Mixed"
  ) {
    return ["Men", "Women"];
  }
  return [wearerType || "Quantity"];
}

export function sizesForUniformType(uniformType: string): string[] {
  if (uniformType === "School Uniform") return ["22", "24", "26", "28", "30", "32", "34", "36", "38"];
  return ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
}

export const FABRIC_OPTIONS = [
  "Cotton",
  "Polyester",
  "Cotton Blend",
  "Dry Fit",
  "Sports Polyester",
  "Customer Preferred Fabric",
  "Not Sure",
];

export const LOGO_PLACEMENTS = ["Left Chest", "Right Chest", "Sleeve", "Back", "Front", "Trouser", "Cap", "Other"];

export const BRANDING_METHODS = ["Embroidery", "Screen Printing", "Sublimation", "Heat Transfer", "Embroidery + Printing", "Not Sure"];

export const GARMENT_MEASUREMENTS: Record<string, string[]> = {
  Shirt: ["Chest", "Shoulder", "Sleeve Length", "Neck", "Shirt Length"],
  "T-shirt": ["Chest", "Shoulder", "Sleeve Length", "Length"],
  "Sports T-shirt": ["Chest", "Shoulder", "Sleeve Length", "Length"],
  Trouser: ["Waist", "Hip", "Thigh", "Inseam", "Full Length"],
  "Track Pant": ["Waist", "Hip", "Thigh", "Inseam", "Full Length"],
  Skirt: ["Waist", "Hip", "Skirt Length"],
  Shorts: ["Waist", "Hip", "Length"],
  "Sports Shorts": ["Waist", "Hip", "Length"],
  Blazer: ["Chest", "Shoulder", "Sleeve", "Waist", "Jacket Length"],
  Jacket: ["Chest", "Shoulder", "Sleeve", "Waist", "Jacket Length"],
  Sweater: ["Chest", "Shoulder", "Sleeve Length", "Length"],
  Tracksuit: ["Chest", "Waist", "Full Length"],
  Polo: ["Chest", "Shoulder", "Sleeve Length", "Length"],
  Scrubs: ["Chest", "Waist", "Length"],
  "Lab Coat": ["Chest", "Shoulder", "Sleeve", "Length"],
};

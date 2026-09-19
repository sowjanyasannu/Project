/**
 * Some product rows carry image paths like `/uploads/real-boy-cardigan-uniform.jpg` —
 * local upload paths from a different system's storage that were never handed over as
 * actual files. They 404 and crash next/image's optimizer, so filter them out and fall
 * back to whatever real (absolute http/https) URLs the row actually has.
 */
export function validImages(images: string[] | null | undefined): string[] {
  return (images ?? []).filter((url) => /^https?:\/\//.test(url));
}

export function firstValidImage(images: string[] | null | undefined): string | null {
  return validImages(images)[0] ?? null;
}

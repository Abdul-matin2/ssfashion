/**
 * Cloudinary helpers — Server Components / Route Handlers only
 * Uses the Admin SDK (service role) for uploads, transformations, and deletions
 */

import { v2 as cloudinary } from "cloudinary";

// Configure once on module load (server-only)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload an image buffer to Cloudinary.
 * Returns { url, public_id, width, height, format }
 */
export async function uploadImage(
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: Record<string, unknown>[];
  } = {}
): Promise<{
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}> {
  const { folder = "ss-fashion/products", public_id, transformation } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        transformation: transformation || [
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
        overwrite: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed: no result"));
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by public_id
 */
export async function destroyImage(public_id: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result.result === "ok";
  } catch (error) {
    console.error("Cloudinary destroy error:", error);
    return false;
  }
}

/**
 * Generate a transformed URL for an existing Cloudinary image
 */
export function getImageUrl(
  public_id: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "scale" | "fit" | "thumb" | "limit" | "pad" | "lfill" | "mfit" | "mpad" | "fill_pad" | "crop";
    gravity?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  const { width, height, crop = "fill", gravity = "auto", quality = "auto:good", format = "auto" } = options;

  return cloudinary.url(public_id, {
    secure: true,
    transformation: [
      { width, height, crop, gravity },
      { quality },
      { fetch_format: format },
    ],
  });
}

/**
 * Generate a set of responsive sizes for ProductCard / ProductDetail
 */
export function getResponsiveImageUrls(public_id: string) {
  return {
    thumbnail: getImageUrl(public_id, { width: 150, height: 150, crop: "fill" }),
    card: getImageUrl(public_id, { width: 350, height: 350, crop: "fill" }),
    detail: getImageUrl(public_id, { width: 800, height: 800, crop: "limit" }),
    zoom: getImageUrl(public_id, { width: 1600, height: 1600, crop: "limit" }),
    original: cloudinary.url(public_id, { secure: true }),
  };
}
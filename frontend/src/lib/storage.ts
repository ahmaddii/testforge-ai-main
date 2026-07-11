import { supabase } from "./supabase";

/**
 * Uploads a blob to the specified Supabase bucket and returns the public URL.
 * @param blob The file blob to upload
 * @param bucket The name of the Supabase bucket
 * @param path The path/filename within the bucket
 */
export async function uploadToStorage(blob: Blob, bucket: string = "voice-notes") {
  const fileName = `${crypto.randomUUID()}.${blob.type.split('/')[1] || 'webm'}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}

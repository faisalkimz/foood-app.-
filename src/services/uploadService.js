import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

const BUCKET = 'food-images';

export async function uploadImage(uri, path) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const filePath = `${path}/${user.id}_${Date.now()}.${ext}`;
  const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  const blob = new Blob([byteArray], { type: contentType });

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, blob, {
      contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

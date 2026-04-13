import { API_KEY_STORAGE_KEY, USERNAME_STORAGE_KEY } from '@/constants';
import { getStorageKey } from '@/utils/storage';
import { buildAuthorization, getUserProfile } from '@retroachievements/api';

export async function checkCreds() {
  const username = await getStorageKey(USERNAME_STORAGE_KEY);
  const apiKey = await getStorageKey(API_KEY_STORAGE_KEY);

  if (!username || !apiKey) {
    return false;
  }
  const authorization = buildAuthorization({ username, webApiKey: apiKey });
  try {
    await getUserProfile(authorization, { username });
    return true;
  } catch {
    return false;
  }
}

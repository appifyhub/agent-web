import { request } from "@/services/networking";
import { parseApiError } from "@/lib/api-error";

export interface RevokeCliTokensResponse {
  status: string;
}

export async function revokeCliTokens({
  apiBaseUrl,
  user_id,
  rawToken,
}: {
  apiBaseUrl: string;
  user_id: string;
  rawToken: string;
}): Promise<RevokeCliTokensResponse> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${rawToken}`,
  };
  const response = await request(
    `${apiBaseUrl}/user/${user_id}/cli/devices`,
    {
      method: "DELETE",
      headers: headers,
    }
  );
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return response.json();
}

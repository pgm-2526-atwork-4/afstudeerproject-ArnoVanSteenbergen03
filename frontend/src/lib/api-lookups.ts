const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type LookupValue = {
  id: number;
  type: string;
  value: string;
  label: string;
  sortOrder: number;
};

// Get lookup values by type
export async function getLookupValues(type: string): Promise<LookupValue[]> {
  const response = await fetch(`${API_BASE_URL}/orders/lookups?type=${encodeURIComponent(type)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lookup values for type: ${type}`);
  }

  return response.json();
}

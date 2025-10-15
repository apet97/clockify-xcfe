/**
 * Builds a link that preserves all current query parameters from the URL
 * @param path - The target path (without query parameters)
 * @returns The full URL with preserved query parameters
 */
export function buildLink(path: string): string {
  // Get current query parameters from window.location
  const currentSearch = window.location.search;
  
  // If the path already contains query parameters, merge them
  const [basePath, existingQuery] = path.split('?');
  
  // Parse existing query parameters from the path
  const existingParams = new URLSearchParams(existingQuery || '');
  
  // Parse current query parameters from the URL
  const currentParams = new URLSearchParams(currentSearch);
  
  // Merge parameters: current URL params take precedence over existing path params
  const mergedParams = new URLSearchParams();
  
  // First add existing path parameters
  for (const [key, value] of existingParams) {
    mergedParams.set(key, value);
  }
  
  // Then override with current URL parameters (preserving auth_token and others)
  for (const [key, value] of currentParams) {
    mergedParams.set(key, value);
  }
  
  // Build the final URL
  const queryString = mergedParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
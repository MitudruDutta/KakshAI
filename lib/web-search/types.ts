/**
 * Web Search Provider Type Definitions
 */

/**
 * Web Search Provider IDs
 */
export type WebSearchProviderId = 'firecrawl';

/**
 * Web Search Provider Configuration
 */
export interface WebSearchProviderConfig {
  id: WebSearchProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  icon?: string;
}

/**
 * Individual search result source
 */
export interface WebSearchSource {
  title: string;
  url: string;
  content: string;
  score?: number;
}

/**
 * Aggregated web search result
 */
export interface WebSearchResult {
  answer: string;
  sources: WebSearchSource[];
  query: string;
  responseTime?: number;
}

/** Simulates network latency for mock API calls. */
export function delay(ms?: number): Promise<void> {
  const duration = ms ?? Math.floor(Math.random() * 300) + 200;
  return new Promise((resolve) => setTimeout(resolve, duration));
}

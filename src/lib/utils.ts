export function generateScreenshotName(modelId: string, stepNumber: number, stepName: string): string {
  const sanitized = stepName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  return `${modelId}_step${stepNumber}_${sanitized}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// streamMonitoring.ts
// Monitoring and diagnostics for WebSocket crypto data feeds
export function monitorStream(metrics, now = Date.now()) {
    const avgLatency = metrics.latencyMs.length > 0
        ? metrics.latencyMs.reduce((a, b) => a + b, 0) / metrics.latencyMs.length
        : 0;
    const sortedLatencies = [...metrics.latencyMs].sort((a, b) => a - b);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);
    const latencyP99 = sortedLatencies.length > 0 ? sortedLatencies[p99Index] : 0;
    const timeSinceLastMessage = now - metrics.lastMessageAt;
    const elapsedSeconds = timeSinceLastMessage / 1000;
    const messagesPerSecond = elapsedSeconds > 0 ? metrics.messagesReceived / elapsedSeconds : 0;
    const errorRate = metrics.messagesReceived > 0 ? metrics.errorCount / metrics.messagesReceived : 0;
    const reconnectRate = metrics.messagesReceived > 0 ? metrics.reconnectAttempts / metrics.messagesReceived : 0;
    let status = 'active';
    if (timeSinceLastMessage > 30000 || errorRate > 0.1) {
        status = 'stale';
    }
    else if (metrics.reconnectAttempts > 3) {
        status = 'resyncing';
    }
    return {
        status,
        avgLatencyMs: avgLatency,
        latencyP99Ms: latencyP99,
        messagesPerSecond,
        errorRate,
        lastMessageAge: timeSinceLastMessage,
        reconnectRate,
    };
}
export function shouldAlert(health) {
    return health.avgLatencyMs > 200 || health.lastMessageAge > 30000 || health.errorRate > 0.1;
}
export function getHealthScore(health) {
    let score = 100;
    score -= Math.min(50, health.avgLatencyMs / 10);
    score -= Math.min(30, health.errorRate * 100);
    score -= Math.min(20, health.lastMessageAge / 1000);
    return Math.max(0, Math.round(score));
}
export function getPerformanceTier(avgLatencyMs) {
    if (avgLatencyMs < 50)
        return 'HFT (Sub-50ms)';
    if (avgLatencyMs < 200)
        return 'Enterprise (50-200ms)';
    if (avgLatencyMs < 500)
        return 'Standard (200-500ms)';
    return 'Degraded (>500ms)';
}
export function formatLatency(ms) {
    if (ms < 1000)
        return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}
export function formatMessageRate(mps) {
    if (mps < 1000)
        return `${mps.toFixed(1)}/s`;
    return `${(mps / 1000).toFixed(2)}K/s`;
}
export function generateDiagnosticReport(streams) {
    const timestamp = Date.now();
    const allMetrics = Array.from(streams.values()).map(s => s.metrics);
    const totalStreams = allMetrics.length;
    const activeStreams = allMetrics.filter(m => m.status === 'active').length;
    const staleStreams = allMetrics.filter(m => m.status === 'stale').length;
    const avgLatencyMs = allMetrics.reduce((sum, m) => sum + m.avgLatencyMs, 0) / totalStreams || 0;
    const avgMessageRate = allMetrics.reduce((sum, m) => sum + m.messagesPerSecond, 0) / totalStreams || 0;
    const alerts = [];
    streams.forEach((stream, streamId) => {
        const health = stream.metrics;
        if (health.avgLatencyMs > 200) {
            alerts.push({
                streamId,
                reason: `High latency: ${formatLatency(health.avgLatencyMs)}`,
                severity: 'warning',
            });
        }
        if (health.lastMessageAge > 30000) {
            alerts.push({
                streamId,
                reason: `No data for ${formatLatency(health.lastMessageAge)}`,
                severity: 'critical',
            });
        }
        if (health.errorRate > 0.1) {
            alerts.push({
                streamId,
                reason: `High error rate: ${(health.errorRate * 100).toFixed(1)}%`,
                severity: 'warning',
            });
        }
    });
    const totalErrors = allMetrics.reduce((sum, m) => sum + Math.round(m.errorRate * 100), 0);
    return {
        timestamp,
        totalStreams,
        activeStreams,
        staleStreams,
        avgLatencyMs,
        avgMessageRate,
        alerts,
    };
}

const { v4: uuidv4 } = require('uuid');

const MAX_LOGS = 500;
let logs = [];

function addLog(level, message) {
  const entry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs = logs.slice(0, MAX_LOGS);
  const icons = { info: 'ℹ', warn: '⚠', error: '✗', success: '✓' };
  console.log(`[${entry.timestamp}] [${icons[level] || '?'}] ${message}`);
  return entry;
}

function getLogs(limit = 200) {
  return logs.slice(0, limit);
}

function clearLogs() {
  logs = [];
}

module.exports = { addLog, getLogs, clearLogs };

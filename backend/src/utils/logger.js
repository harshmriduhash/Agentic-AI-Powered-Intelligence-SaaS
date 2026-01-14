import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  constructor() {
    this.logsDir = path.join(__dirname, '../../logs');
    this.ensureLogsDirectory();
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    });
  }

  writeToFile(filename, message) {
    const filepath = path.join(this.logsDir, filename);
    fs.appendFileSync(filepath, message + '\n');
  }

  info(message, meta = {}) {
    const log = this.formatMessage('INFO', message, meta);
    console.log(`ℹ️  ${message}`, meta);
    this.writeToFile('info.log', log);
  }

  error(message, error = null, meta = {}) {
    const log = this.formatMessage('ERROR', message, {
      ...meta,
      error: error?.message,
      stack: error?.stack
    });
    console.error(`❌ ${message}`, error);
    this.writeToFile('error.log', log);
  }

  warn(message, meta = {}) {
    const log = this.formatMessage('WARN', message, meta);
    console.warn(`⚠️  ${message}`, meta);
    this.writeToFile('warn.log', log);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const log = this.formatMessage('DEBUG', message, meta);
      console.debug(`🔍 ${message}`, meta);
      this.writeToFile('debug.log', log);
    }
  }

  agent(agentName, message, meta = {}) {
    const log = this.formatMessage('AGENT', message, {
      agent: agentName,
      ...meta
    });
    console.log(`🤖 [${agentName}] ${message}`);
    this.writeToFile('agents.log', log);
  }

  collector(source, message, meta = {}) {
    const log = this.formatMessage('COLLECTOR', message, {
      source,
      ...meta
    });
    console.log(`📡 [${source}] ${message}`);
    this.writeToFile('collectors.log', log);
  }
}

export default new Logger();
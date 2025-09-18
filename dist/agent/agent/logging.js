"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHandledTweet = logHandledTweet;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const LOG_FILE_PATH = path.join(__dirname, '..', 'handled_tweets.json');
function readLogFile() {
    try {
        if (fs.existsSync(LOG_FILE_PATH)) {
            const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.error('Error reading log file:', error);
    }
    return [];
}
function writeLogFile(data) {
    try {
        fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error('Error writing to log file:', error);
    }
}
function logHandledTweet(tweetId, reply) {
    const logData = readLogFile();
    const newEntry = {
        tweetId,
        reply,
        timestamp: new Date().toISOString(),
    };
    logData.push(newEntry);
    writeLogFile(logData);
    console.log(`📝 Logged reply for tweet ${tweetId}`);
}

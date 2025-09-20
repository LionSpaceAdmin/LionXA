import * as fs from 'fs';
import * as path from 'path';
import { config } from './config';

const LOG_FILE_PATH = config.data.handledTweets;

interface HandledTweet {
    tweetId: string;
    reply: string;
    timestamp: string;
}

function readLogFile(): HandledTweet[] {
    try {
        if (fs.existsSync(LOG_FILE_PATH)) {
            const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
            return JSON.parse(data) as HandledTweet[];
        }
    } catch (error) {
        console.error('Error reading log file:', error);
    }
    return [];
}

function writeLogFile(data: HandledTweet[]): void {
    try {
        fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
}

export function logHandledTweet(tweetId: string, reply: string): void {
    const logData = readLogFile();
    const newEntry: HandledTweet = {
        tweetId,
        reply,
        timestamp: new Date().toISOString(),
    };
    logData.push(newEntry);
    writeLogFile(logData);
    console.log(`📝 Logged reply for tweet ${tweetId}`);
}

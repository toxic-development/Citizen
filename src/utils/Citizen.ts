import crypto from 'crypto';
import Citizen from '../client/Citizen';

/**
 * CLIENT UTILITIES YES
 * @property {CitizenUtilities} CitizenUtilities
 * @param {string} generateID - Generates a random ID.
 * @param {string} obfuscateIP - Obfuscates an IP address.
 */
export class CitizenUtilities {
    public client: Citizen;
    public EncryptionKey: any;
    public IV: string;


    constructor(client: Citizen) {
        this.client = client;
        this.EncryptionKey = Buffer.from(process.env.ENCRYPTION_KEY as string, 'utf8');
        this.IV = process.env.IV as string;
    }

    public generateID(): string {
        let id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 10; i++) id += possible.charAt(Math.floor(Math.random() * possible.length));
        return id;
    }


    public obfuscateIP(ip: string): string {
        const iv = crypto.randomBytes(12); // GCM recommends 12 bytes
        const cipher = crypto.createCipheriv('aes-256-gcm', this.EncryptionKey, iv);
        let encrypted = cipher.update(ip, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex'); // Prepend IV and append tag to the encrypted data
    }

    public removeObfuscation(encryptedIp: string): string {
        const parts: any = encryptedIp.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const tag = Buffer.from(parts.pop(), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.EncryptionKey, iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(parts.join(':'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    public formatBytes(bytes: number, decimals = 2): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    public formatDate(date: Date): string {

        let BaseDate = new Date(date);

        let options: any = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }

        return BaseDate.toLocaleString('en-US', options);
    }

    public formatUptime(ms: any) {
        const sec = Math.floor((ms / 1000) % 60).toString();
        const min = Math.floor((ms / (1000 * 60)) % 60).toString()
        const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
        const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString()

        return {
            days: days.padStart(1, '0'),
            hours: hrs.padStart(2, '0'),
            minutes: min.padStart(2, '0'),
            seconds: sec.padStart(2, '0')
        }
    }

    public formatTime(seconds: any): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${secs > 0 ? `${secs}s` : ""}`;
    }

    public formatNumber(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    public formatPercentage(current: number, max: number): string {
        return `${Math.floor((current / max) * 100)}%`;
    }

    public formatNumberWithCommas(number: number): string {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    public formatNumberWithK(number: number): string {
        return number > 999 ? `${(number / 1000).toFixed(1)}k` : number.toString();
    }

    public formatNumberWithM(number: number): string {
        return number > 999999 ? `${(number / 1000000).toFixed(1)}m` : number.toString();
    }
}
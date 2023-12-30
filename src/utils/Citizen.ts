/**
 * CLIENT UTILITIES YES
 * @property {CitizenUtilities} CitizenUtilities
 * @param {string} generateID - Generates a random ID.
 * @param {string} obfuscateIP - Obfuscates an IP address.
 */
export class CitizenUtilities {
  
    public generateID(): string {
        let id = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 10; i++) id += possible.charAt(Math.floor(Math.random() * possible.length));
        return id;
    }


    public obfuscateIP(ip: string) {
        const split = ip.split(".");
        return `${split[0]}.${split[1]}.XXX.XXX`;
    }

    public removeObfuscation(ip: string) {
        const split = ip.split(".");
        return `${split[0]}.${split[1]}.${split[2]}.${split[3]}`;
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
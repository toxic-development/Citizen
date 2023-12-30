import { EmbedBuilder, HexColorString, EmbedField } from "discord.js";
import config from "../config/config";

/**
 * @file EmbedBuilder - EmbedBuilder class
 */
export class CitizenEmbed extends EmbedBuilder {
    /**
     * @param {string} title - Embed's title
     * @param {string} description - Embed's description
     * @param {string} color - Embed's color
     */
    constructor(data: { title: string, description: string, color: HexColorString, fields?: EmbedField[] }) {
        super();
    
        this.setTitle(data.title);
        this.setDescription(data.description);
        this.setThumbnail(config.ClientLogo);
        if (data.color) this.setColor(data.color);
        if (data.fields) this.setFields(data.fields);
        this.setTimestamp();
        this.setFooter({
            text: config.FooterText,
            iconURL: config.ClientLogo
        })
    }
}
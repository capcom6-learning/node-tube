//@ts-check

module.exports = class MessagingService {
    /**
     * @param {import('amqplib').Channel} channel
     */
    constructor(channel) {
        this.channel = channel;
    }

    init() {
        return this.channel.assertExchange('video-uploaded', 'fanout');
    }

    /**
     * @param {{ _id: string, name: string, videoPath: string }} metadata
     */
    videoUploaded(metadata) {
        const message = JSON.stringify(metadata);

        return this.channel.publish('video-uploaded', '', Buffer.from(message));
    }
}

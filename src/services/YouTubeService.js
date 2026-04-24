const { YouTube } = require('youtube-sr');
const { spawn } = require('child_process');

/**
 * YouTubeService — Video arama ve stream URL çıkarma sorumluluğunu taşır.
 */
class YouTubeService {
    /**
     * Sorguya göre video metadata'sı çöz.
     * URL verilirse doğrudan getVideo; arama terimi verilirse searchOne kullanır.
     *
     * @param {string} query - YouTube URL'si veya arama terimi
     * @returns {Promise<{ url: string, title: string, thumbnail: string|null, duration: string }>}
     */
    async resolve(query) {
        const isUrl =
            query.includes('youtube.com') ||
            query.includes('youtu.be');

        if (isUrl) {
            return this._fromUrl(query);
        }
        return this._fromSearch(query);
    }

    /**
     * @private
     */
    async _fromUrl(url) {
        try {
            const video = await YouTube.getVideo(url);
            return {
                url,
                title: video.title ?? 'YouTube Video',
                thumbnail: video.thumbnail?.url ?? null,
                duration: video.durationFormatted ?? 'Bilinmiyor',
            };
        } catch {
            // Metadata alınamazsa sadece URL'yi döndür
            return { url, title: 'YouTube Video', thumbnail: null, duration: 'Bilinmiyor' };
        }
    }

    /**
     * @private
     */
    async _fromSearch(query) {
        const video = await YouTube.searchOne(query);
        if (!video) throw new Error('❌ Video bulunamadı!');
        return {
            url: video.url,
            title: video.title ?? 'YouTube Video',
            thumbnail: video.thumbnail?.url ?? null,
            duration: video.durationFormatted ?? 'Bilinmiyor',
        };
    }

    /**
     * yt-dlp ile çalınabilir stream URL'si al.
     *
     * @param {string} videoUrl
     * @returns {Promise<string>}
     */
    getStreamUrl(videoUrl) {
        return new Promise((resolve, reject) => {
            const ytdlp = spawn('yt-dlp', [
                '-f', 'bestaudio[ext=webm]/bestaudio',
                '-g',
                '--no-playlist',
                '--no-warnings',
                videoUrl,
            ]);

            let output = '';
            let errorOutput = '';

            ytdlp.stdout.on('data', (data) => { output += data.toString(); });
            ytdlp.stderr.on('data', (data) => { errorOutput += data.toString(); });

            ytdlp.on('close', (code) => {
                if (code === 0) {
                    resolve(output.trim().split('\n')[0]);
                } else {
                    reject(new Error(`yt-dlp hatası: ${errorOutput.trim()}`));
                }
            });

            ytdlp.on('error', (err) => {
                reject(new Error(`yt-dlp bulunamadı: ${err.message}`));
            });
        });
    }
}

module.exports = YouTubeService;

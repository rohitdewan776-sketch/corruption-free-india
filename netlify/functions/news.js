const NEWS_TERMS =
    /\b(corrupt(?:ion|ed)?|brib(?:e|ery|es)|graft|vigilance|anti[- ]corruption|anti-graft|kickback|disproportionate assets|money laundering|lokayukta|prevention of corruption|fraud|scam|extortion|embezzlement|misappropriation|cbi|enforcement directorate|ed raid|anti-corruption bureau)\b|भ्रष्टाचार|रिश्वत|घोटाला|भ्रष्टाचारी/i;

const SOURCES = [
    {
        name: 'The Hindu',
        url: 'https://www.thehindu.com/news/national/feeder/default.rss',
        hosts: ['thehindu.com']
    },
    {
        name: 'The Indian Express',
        url: 'https://indianexpress.com/section/india/feed/',
        hosts: ['indianexpress.com']
    },
    {
        name: 'Times of India',
        url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms',
        hosts: ['timesofindia.indiatimes.com']
    },
    {
        name: 'Hindustan Times',
        url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml',
        hosts: ['hindustantimes.com']
    }
];

function decodeXml(value) {
    return value
        .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function elementValue(xml, tag) {
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = xml.match(new RegExp(
        `<(?:[\\w.-]+:)?${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${escapedTag}\\s*>`,
        'i'
    ));
    if (!match) return '';
    return decodeXml(match[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')).trim();
}

function plainText(value) {
    return decodeXml(value)
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 320);
}

function mediaUrl(item) {
    const candidates = [
        item.match(/<(?:media:)?thumbnail\b[^>]*\burl=["']([^"']+)["']/i)?.[1],
        item.match(/<media:content\b[^>]*\burl=["']([^"']+)["']/i)?.[1],
        item.match(/<enclosure\b[^>]*\burl=["']([^"']+)["']/i)?.[1]
    ];
    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            const url = new URL(decodeXml(candidate));
            if (url.protocol === 'https:') return url.href;
        } catch {
            continue;
        }
    }
    return '';
}

async function fetchSource(source) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
        const response = await fetch(source.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'CorruptionFreeIndiaNews/1.0 (+https://corruption-free-india.netlify.app)' }
        });
        if (!response.ok) throw new Error(`${source.name} returned HTTP ${response.status}`);
        const xml = await response.text();
        if (!/<rss\b|<feed\b/i.test(xml)) throw new Error(`${source.name} returned an unsupported feed`);

        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
            .map(([, item]) => {
                const title = plainText(elementValue(item, 'title'));
                const description = plainText(
                    elementValue(item, 'description') || elementValue(item, 'encoded')
                );
                const publishedAt = elementValue(item, 'pubDate') || elementValue(item, 'date');
                const articleDate = Date.parse(publishedAt);
                let articleUrl;
                try {
                    articleUrl = new URL(elementValue(item, 'link'));
                } catch {
                    return null;
                }
                const host = articleUrl.hostname.toLowerCase().replace(/^www\./, '');
                const trustedHost = source.hosts.some(allowed =>
                    host === allowed || host.endsWith(`.${allowed}`)
                );
                if (
                    !title ||
                    articleUrl.protocol !== 'https:' ||
                    !trustedHost ||
                    !NEWS_TERMS.test(`${title} ${description}`) ||
                    (Number.isFinite(articleDate) && articleDate < cutoff)
                ) return null;
                return {
                    title,
                    description,
                    url: articleUrl.href,
                    source: source.name,
                    imageUrl: mediaUrl(item),
                    publishedAt
                };
            })
            .filter(Boolean);
    } finally {
        clearTimeout(timeout);
    }
}

exports.handler = async function handler() {
    const results = await Promise.allSettled(SOURCES.map(fetchSource));
    const items = [];
    const sourcesFailed = [];
    let sourcesUpdated = 0;

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            sourcesUpdated += 1;
            items.push(...result.value);
        } else {
            console.error(`News source unavailable (${SOURCES[index].name}):`, result.reason);
            sourcesFailed.push(SOURCES[index].name);
        }
    });

    if (!sourcesUpdated) {
        return {
            statusCode: 502,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            body: JSON.stringify({ error: 'All publisher news feeds are temporarily unavailable.' })
        };
    }

    const unique = new Map();
    items
        .sort((a, b) => Date.parse(b.publishedAt || '') - Date.parse(a.publishedAt || ''))
        .forEach(item => {
            const key = item.url;
            if (!unique.has(key)) unique.set(key, item);
        });

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600'
        },
        body: JSON.stringify({
            items: [...unique.values()].slice(0, 60),
            sourcesUpdated,
            sourcesFailed
        })
    };
};

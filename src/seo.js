const Apify = require('apify');
const Bluebird = require('bluebird');

const { injectJQuery } = Apify.utils.puppeteer;

const DEFAULT_SEO_PARAMS = {
    maxTitleLength: 70,
    minTitleLength: 10,
    maxMetaDescriptionLength: 140,
    maxLinksCount: 3000,
    maxWordsCount: 350,
    outputLinks: false,
    workingStatusCodes: [200, 301, 302, 304],
};

/**
 * @param {Puppeteer.Page} page
 * @param {any} userParams
 */
async function basicSEO(page, userParams = {}) {
    await injectJQuery(page);
    const seoParams = {
        ...DEFAULT_SEO_PARAMS,
        ...userParams,
    };
    const { origin } = new URL(page.url());

    const fetchInBrowser = (url) => page.evaluate(async (pUrl) => {
        try {
            const { status } = await window.fetch(pUrl, {
                method: 'GET',
                mode: 'no-cors',
                headers: {
                    Accept: '*/*',
                },
                referrerPolicy: 'no-referrer',
            });

            return status;
        } catch (e) {
            return 500;
        }
    }, url);

    const seo = await page.evaluate(async (params) => {
        const $ = window.jQuery;
        const result = {};
        // Check flash content
        if ($('script:contains(embedSWF)').length) result.isUsingFlash = true;
        // -- Google Analytics
        // Check for GA Object (e.g crawler can not find function(i,s,o,g,r,a,m) in meteor page like Apifier)
        result.isGoogleAnalyticsObject = (typeof ga !== 'undefined');
        // Check for GA function (function(i,s,o,g,r,a,m)) exists in page
        result.isGoogleAnalyticsFunc = !!($('script:contains(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\'])').length);
        // -- Meta charset
        result.isCharacterEncode = !!($('meta[charset]'));
        // -- Meta description
        result.isMetaDescription = !!($('meta[name=description]').length);
        if (result.isMetaDescription) {
            result.metaDescription = $('meta[name=description]').attr('content');
            result.isMetaDescriptionEnoughLong = (result.metaDescription.length < params.maxMetaDescriptionLength);
        }
        // --  Doctype
        result.isDoctype = !!(document.doctype);
        // -- Title
        if ($('title').length) {
            result.isTitle = true;
            result.title = $('title').text();
            const titleLength = result.title.length;
            result.isTitleEnoughLong = (titleLength <= params.maxTitleLength) && (titleLength >= params.minTitleLength);
        } else result.isTitle = false;
        // -- h1
        const h1Count = $('h1').length;
        result.isH1 = (h1Count > 0);
        if (result.isH1) result.h1 = $('h1').text();
        result.isH1OnlyOne = (h1Count === 1);
        // -- h2
        result.isH2 = !!($('h2').length);
        // -- Links
        const $allLinks = $('a');
        result.linksCount = $allLinks.length;
        result.isTooEnoughLinks = (result.linksCount < params.maxLinksCount);
        result.internalNoFollowLinks = [];
        $allLinks.each(function () {
            if ($(this).attr('rel') === 'nofollow'
                && this.href.includes(window.location.hostname)) {
                result.internalNoFollowLinks.push(this.href);
            }
        });
        result.internalNoFollowLinksCount = result.internalNoFollowLinks.length;
        // Check broken links
        result.linkUrls = $allLinks
            .filter((index, el) => {
                const href = $(el).attr('href');
                return href
                    && !href.includes('javascript:')
                    && !href.includes('mailto:');
            }).map((index, el) => el.href)
            .toArray();
        result.internalLinks = $allLinks.filter((index, el) => {
            const $el = $(el);
            const href = $el.attr('href');
            return $el.is('a[href]:not([target="_blank"]),a[href]:not([rel*="nofollow"]),a[href]:not([rel*="noreferrer"])')
                && href.includes(window.location.hostname)
                && !href.includes('javascript:')
                && !href.includes('mailto:');
        })
            .map((index, el) => el.href)
            .toArray();
        // -- images
        result.imageUrls = [];
        result.notOptimizedImages = [];
        $('img').each(function () {
            result.imageUrls.push(this.src);
            if (!$(this).attr('alt')) result.notOptimizedImages.push(this.src);
        });
        result.notOptimizedImagesCount = result.notOptimizedImages.length;
        // -- words count
        result.wordsCount = document.body.innerText.split(/\b(\p{Letter}+)\b/gu).filter((s) => s).length;
        result.isContentEnoughLong = (result.wordsCount < params.maxWordsCount);
        // -- viewport
        result.isViewport = !!($('meta[name=viewport]'));
        // -- amp version if page
        result.isAmp = !!($('html[⚡]') || $('html[amp]'));
        // -- iframe check
        result.isNotIframe = !($('iframe').length);
        result.pageIsBlocked = $('meta[name=robots][content]')
            .filter((index, s) => ['noindex', 'nofollow'].some((x) => s.content.includes(x)))
            .length > 0;

        return result;
    }, seoParams);

    const { workingStatusCodes } = seoParams;

    seo.robotsFileExists = workingStatusCodes.includes(await fetchInBrowser(`${origin}/robots.txt`));
    seo.faviconExists = workingStatusCodes.includes(await fetchInBrowser(`${origin}/favicon.ico`));

    // Check broken links
    const internalBrokenLinks = new Set();
    const allBrokenLinks = new Set();
    await Bluebird.map(seo.internalLinks, (url) => {
        if (internalBrokenLinks.has(url)) {
            return;
        }

        return fetchInBrowser(url).then((res) => {
            if (!workingStatusCodes.includes(res)) {
                internalBrokenLinks.add(url);
            }
        });
    }, { concurrency: 2 });
    seo.brokenLinksCount = internalBrokenLinks.size;

    if (!seoParams.outputLinks) {
        delete seo.internalLinks;
    }

    seo.brokenLinks = [...internalBrokenLinks];

    await Bluebird.map(seo.linkUrls, (url) => {
        if (internalBrokenLinks.has(url) || allBrokenLinks.has(url)) {
            return;
        }

        return fetchInBrowser(url).then((res) => {
            if (!workingStatusCodes.includes(res)) {
                allBrokenLinks.add(url);
            }
        });
    }, { concurrency: 2 });
    seo.externalBrokenLinksCount = allBrokenLinks.size;
    seo.externalBrokenLinks = [...allBrokenLinks];

    if (!seoParams.linkUrls) {
        delete seo.linkUrls;
    }

    // Check broken images
    seo.brokenImages = [];
    await Bluebird.map(seo.imageUrls, (imageUrl) => {
        return fetchInBrowser(imageUrl).then((res) => {
            if (!workingStatusCodes.includes(res)) {
                seo.brokenImages.push(imageUrl);
            }
        });
    }, { concurrency: 2 });
    seo.brokenImagesCount = seo.brokenImages.length;
    delete seo.imageUrls;

    return seo;
}

module.exports = {
    basicSEO,
};

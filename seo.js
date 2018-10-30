const Apify = require('apify');
const fetch = require('node-fetch');
const Promise = require('bluebird');

const { injectJQuery } = Apify.utils.puppeteer;

const DEFAULT_SEO_PARAMS = {
    maxTitleLength: 70,
    minTitleLength: 10,
    maxMetaDescriptionLength: 140,
    maxLinksCount: 3000,
    maxWordsCount: 350,
};

async function basicSEO(page, userParams = {}) {
    await injectJQuery(page);
    const params = Object.assign(DEFAULT_SEO_PARAMS, userParams);
    const basicSEO = await page.evaluate(async (params) => {
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
            result.isMetaDescriptionLong = (result.metaDescription.length > params.maxMetaDescriptionLength);
        }
        // --  Doctype
        result.isDoctype = !!(document.doctype);
        // -- Title
        if ($('title').length) {
            result.isTitle = true;
            result.title = $('title').text();
            const titleLength = result.title.length;
            result.isTitleLong = (titleLength > params.maxTitleLength);
            result.isTitleShort = (titleLength < params.minTitleLength);
        } else result.isTitle = false;
        // -- h1
        const h1Count = $('h1').length;
        result.isH1 = (h1Count > 0);
        if (result.isH1) result.h1 = $('h1').text();
        result.isH1Multiple = (h1Count > 1);
        // -- h2
        result.isH2 = !!($('h2').length);
        // -- Links
        const $allLinks = $('a');
        result.linksCount = $allLinks.length;
        result.isTooMuchlinks = (result.linksCount > params.maxLinksCount);
        result.internalNoFollowLinks = [];
        $allLinks.each(function () {
            if ($(this).attr('rel') === 'nofollow'
                && this.href.indexOf(window.location.hostname) > -1) {
                result.internalNoFollowLinks.push(this.href);
            }
        });
        result.internalNoFollowLinksCount = result.internalNoFollowLinks.length;
        // Check broken links
        result.linkUrls = $allLinks
            .filter(function () {
                const href = $(this).attr('href');
                return href && !href.includes('javascript:') && !href.includes('mailto:');
            }).map(function () {
                return this.href;
            })
            .toArray();
        // -- images
        result.imageUrls = [];
        result.notOptimizedImgs = [];
        $('img').each(function () {
            result.imageUrls.push(this.src);
            if (!$(this).attr('alt')) result.notOptimizedImgs.push(this.src);
        });
        result.notOptimizedImgsCount = result.notOptimizedImgs.length;
        // -- words count
        result.wordsCount = $('body').text().match(/\S+/g).length;
        result.isContentTooLong = (result.wordsCount > params.maxWordsCount);
        // -- viewport
        result.isViewport = !!($('meta[name=viewport]'));
        // -- amp version if page
        result.isAmp = !!($('html[⚡]') || $('html[amp]'));
        // -- iframe check
        result.isIframe = !!($('iframe').length);

        // TODO: Check broken links and images
        /*
        // -- check broken links
    context.willFinishLater();
    var promises = [];
    result.brokenLinks = {
    internal: [],
    external: []
    };
    $('a').each(function() {
    var self = this;
    // skips mailto and JS href
    if (self.href.indexOf('javascript:') === -1 && self.href.indexOf('mailto:') === -1) {
        var p = $.get(self.href)
        .done(function(data) {
            // good link
        })
        .fail(function( jqXHR, textStatus, errorThrown ){
            if (errorThrown.name === 'SecurityError') {
                // need to fix this error, page blocked jquery requests
                // FIX: We can do requests from other page
            }
            // broken link
            if (window.location.hostname == self.hostname) result.brokenLinks.internal.push(self.href);
            else result.brokenLinks.external.push(self.href);
        });
        promises.push(p);
    }
    });
    // -- check broken images
    result.brokenImgs = {
    internal: [],
    external: []
    };
    $('a').each(function() {
    var self = this;
    var p = $.get(self.src, function() {
        // good image
    })
    .fail(function() {
        // broken image
        if (self.src.split('?')[0].indexOf(window.location.hostname) > -1)
            result.brokenImgs.internal.push(self.href);
        else
            result.brokenImgs.external.push(self.href);
    });
    promises.push(p);
    });
         */

        return result;
    }, params);

    // Check broken links
    basicSEO.brokenLinks = [];
    await Promise.map(basicSEO.linkUrls, (url) => {
        return fetch(url).then((res) => {
            if (res.status !== 200) basicSEO.brokenLinks.push(url);
        }).catch(() => basicSEO.brokenLinks.push(url));
    });
    basicSEO.brokenLinksCount = basicSEO.brokenLinks.length;
    delete basicSEO.linkUrls;

    // Check broken images
    basicSEO.brokenImages = [];
    await Promise.map(basicSEO.imageUrls, (imageUrl) => {
        return fetch(imageUrl).then((res) => {
            if (res.status !== 200) basicSEO.brokenImages.push(imageUrl);
        }).catch(() => basicSEO.brokenImages.push(imageUrl));
    });
    basicSEO.brokenImagesCount = basicSEO.brokenImages.length;
    delete basicSEO.imageUrls;

    return basicSEO;
}

module.exports = {
    basicSEO,
};

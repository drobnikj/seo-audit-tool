const Apify = require('apify');
const { URL } = require('url');

const { PseudoUrl } = Apify;
const { enqueueLinks } = Apify.utils.puppeteer;

const { basicSEO } = require('./seo.js');
const { jsonLdLookup, microdataLookup } = require('./ontology_lookups.js');
const { generateReport } = require('./templating.js');

Apify.main(async () => {
    const { startUrl, maxConcurrency } = await Apify.getValue('INPUT');
    console.log(`SEO audit for ${startUrl} started`);

    await Apify.setValue('TEST', html, { contentType: 'text/html' });

    return;

    // Get web hostname
    const { hostname } = new URL(startUrl);
    const pseudoUrl = new PseudoUrl(`[http|https]://[.*]${hostname}[.*]`);

    console.log(`Web host name: ${hostname}`);

    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: startUrl });

    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        maxConcurrency,

        launchPuppeteerOptions: { useApifyProxy: true },
        gotoFunction: ({ request, page }) => page.goto(request.url, { waitUntil: 'networkidle2' }),

        handlePageFunction: async ({ request, page }) => {
            console.log(`Start processing ${request.url}`);

            const data = {
                url: page.url(),
                title: await page.title(),
                isLoaded: true,
            };

            const SEO = await basicSEO(page);
            Object.assign(data, SEO);
            data.jsonLd = await jsonLdLookup(page);
            data.microdata = await microdataLookup(page);

            await Apify.pushData(data);

            // Enqueue links
            const enqueueResults = await enqueueLinks(page, 'a[href]', [pseudoUrl], requestQueue);
            const newRequests = enqueueResults.filter((result) => (!result.wasAlreadyPresent));
            if (newRequests.length) console.log(`${request.url}: Added ${newRequests.length} urls to queue.`);

            console.log(`${request.url}: Finished`);
        },

        handleFailedRequestFunction: async ({ request, error }) => {
            console.log(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                url: request.url,
                isLoaded: false,
                errorMessage: error.message,
            });
        },
    });

    await crawler.run();

    console.log(`SEO audit for ${startUrl} finished.`);
});

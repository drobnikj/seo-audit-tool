- [Features](#features)
- [Input](#input)
- [Results](#results)
- [Example result](#example-result)

## Features
This SEO audit tool can crawl all the web pages on your website and alert you to errors or issues that could affect SEO performance.

## Input
Web URL is the most important input that you should set, as this is address is where the tool will start crawling.

## Results
All results are stored in Apify datasets. Each result has the following attributes:

- url - URL of page
- title - title of page
- isLoaded - true if page was loaded properly
- isGoogleAnalyticsObject - check if Google Analytics object is included in the page
- isGoogleAnalyticsFunc - check if Google Analytics function is included in the page
- isCharacterEncode - check if page has meta tag with charset attribute
- isMetaDescription - check if page has meta description
- metaDescription - value from meta description
- isMetaDescriptionEnoughLong - check if length of meta description is long enough
- isDoctype - check if doctype is included in page
- isTitle - check if title element is included in page
- isTitleEnoughLong - check if title is long enough
- isH1 - check if H1 element is present on page
- h1 - value from H1 element
- isH1OnlyOne - check that there is only one H1 on page
- isH2 - check if H2 element is present on page
- linksCount - number of links on page
- isTooEnoughLinks - check if there are enough links on page
- internalNoFollowLinks - list of no-follow links on page
- internalNoFollowLinksCount - number of no-follow links on page
- notOptimizedImages - list of unoptimized images (does not include alt tag)
- notOptimizedImagesCount - number of unoptimized images
- wordsCount - number of words on page
- isContentEnoughLong - check if content is long enough
- isViewport - check if meta tag viewport is set on page
- isAmp - check if amp tag is set on page
- isNotIframe - check that there is no iframe
- brokenLinks - list of broken links on page
- brokenLinksCount - number of broken links on page
- brokenImages - list of broken images on page
- brokenImagesCount - number of broken image links on page
- jsonLd - data from JSON-LD specifications
- microdata - data from microdata specifications

## Example result

```javascript
{
  "url": "https://www.apify.com/",
  "title": "Web Scraping, Data Extraction and Automation - Apify",
  "isLoaded": true,
  "isGoogleAnalyticsObject": true,
  "isGoogleAnalyticsFunc": false,
  "isCharacterEncode": true,
  "isMetaDescription": true,
  "metaDescription": "Apify extracts data from websites, crawls lists of URLs and automates workflows on the web. Turn any website into an API in a few minutes!",
  "isMetaDescriptionEnoughLong": true,
  "isDoctype": true,
  "isTitle": true,
  "isTitleEnoughLong": true,
  "isH1": true,
  "h1": "The web scraping and automation platform",
  "isH1OnlyOne": true,
  "isH2": true,
  "linksCount": 91,
  "isTooEnoughlinks": true,
  "internalNoFollowLinks": [],
  "internalNoFollowLinksCount": 0,
  "notOptimizedImgs": [],
  "notOptimizedImagesCount": 0,
  "wordsCount": 1373,
  "isContentEnoughLong": false,
  "isViewport": true,
  "isAmp": true,
  "isNotIframe": false,
  "brokenLinks": [],
  "brokenLinksCount": 0,
  "brokenImages": [],
  "brokenImagesCount": 0,
  "jsonLd": {
    "isJsonLd": false,
    "jsonLdData": {}
  },
  "microdata": {
    "isMicrodata": false,
    "microdata": []
  }
}
```


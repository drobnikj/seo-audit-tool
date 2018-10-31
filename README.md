# SEO audit tool

This SEO audit tool crawls all your site pages and returns audit result for each one.

## Input
You can set up `Web URL`. This is URL, where tools starts crawling.

## Results
All results are stored in Apify datasets.
Each result has following attributes:
- url - URL of page
- title - Title of page
- isLoaded - `true` if page was loaded properly
- isGoogleAnalyticsObject - Check if Google Analytics object is on the page included
- isGoogleAnalyticsFunc - Check if Google Analytics function is on the page included
- isCharacterEncode - Check if page has meta tag with charset attribute
- isMetaDescription - Check if page has meta description
- metaDescription - Value from meta description
- isMetaDescriptionEnoughLong - Check if length meta description is long enough
- isDoctype - Check if element doctype is on the page included
- isTitle - Check if element title is on the page included
- isTitleEnoughLong - Check if title is long enough
- isH1 - Check if element H1 is presented on page
- h1 - Value from H1 element
- isH1OnlyOne - Check if there is only one H1 on page
- isH2 - Check if element H2 is presented on page
- linksCount - Number of links on page,
- isTooEnoughLinks - Check if there is not much links on page,
- internalNoFollowLinks - List of not follow links on page,
- internalNoFollowLinksCount - Number of not follow links on page,
- notOptimizedImages - List of not optimized images (Does not include alt tag)
- notOptimizedImagesCount - Number of not optimized images,
- wordsCount - Numbers of words on page
- isContentEnoughLong - Check if content is long enough
- isViewport - Check if meta tag viewport is set on page
- isAmp - Check if amp tag is set on page
- isNotIframe - Check if there is not iframe
- brokenLinks - List of broken links on page,
- brokenLinksCount - Number of broken links on page,
- brokenImages - List of broken images on page,
- brokenImagesCount - Number of broken links on page
- jsonLd - Data from jsonLd specifications
- microdata - Data from microdata specifications

### Example Result
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
  "h1": "The web scraping and automation platform",
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

const express = require('express');
const { renderResult, renderPage } = require('./result_renderer');

const LOADING_PAGE = renderPage(`
<h1>Starting crawler ...</h1>
<div class="progress">
    <div
        class="progress-bar progress-bar-striped bg-danger"
        role="progressbar"
        style="width: 100%"
        aria-valuenow="100"
        aria-valuemin="0"
        aria-valuemax="100">
    </div>
</div>`, true);

/**
 * Starts the webserver serving intermediate results.
 * @param  {Number} port
 * @param  {String} url
 * @param  {EventEmitter} resultsEmitter
 */
exports.startWebServer = (port, url, resultsEmitter) => {
    const app = express();
    let pageHtml = LOADING_PAGE;

    resultsEmitter.on('results', (results, isRunning) => {
        pageHtml = renderResult(results, isRunning);
    });

    app.get('/', (req, res) => {
        res.send(pageHtml);
    });

    app.listen(port, () => {
        console.log(`Application is listening at URL ${url}.`);
    });
};

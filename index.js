const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
    // launch browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // go to Hacker News
    await page.goto("https://news.ycombinator.com/newest");

    let news = [];
    // gets the articles and its date string
    while (news.length < 100) {
        const TopArticles = await page.$$eval('.athing', articles =>
            articles.map(a => {
                const article = a.textContent.trim();
                const subtext = a.nextElementSibling;
                const dateAge = subtext.querySelector('td.subtext span.age');
                const dateString = dateAge.getAttribute('title');
                const date = new Date(dateString)
                return { article, date };
            })
        );
        // stores the article text and date in the news array, combines what is in there already avoiding duplication
        news = [...new Set([...news, ...TopArticles])];      
        
        // checks and breaks the cycle if the array has 100 or more articles
        if (news.length >= 100) {
            break;
        }

        // loads more articles by clicking in the More button.
        const nextPage = await page.$('a.morelink');
        if (nextPage) {
            await nextPage.click();
            await page.waitForTimeout(2000);
        }
    }

    // every page loads 30 articles so it slices to 100 when it reaches 120 articles
    news = news.slice(0, 100);

    // checks the current date and sorts the articles by comparing the article date with the current date
    const currentDate = new Date();
    const sortedNews = news.sort((a, b) => {
        const itemA = currentDate - a.date;
        const itemB = currentDate - b.date;
        return itemA - itemB;
    });

    // logs the results
    console.log(sortedNews);
}

(async () => {
    // calls the function and exit the script when it's done
    await sortHackerNewsArticles();
    process.exit(0);
})();


# exrx-scraper

This is a scraper for the exercises directory of Exrx.net.
It is made using puppeteer(a headless chromium browser) ontop of javascript.

## Requirements

- Node v18 (for fetch, i think 17 works as well)
- run `npm install`

## about

The original that this was forked from was incomplete (would not pull deeper than the name of the muscle groups), this is my work on completing it.

- Run using `npm run main`
- This will create a data.json with exercises of Exrx.net

### Todo

[ ] aggregate the "see more" data to be able to symlink all exercises to their propper muscle groups

[x] Triply nested exercise variants are not being retrieved properly however the logic is there to easily fix when i get the opportunity

[x] The organization of the JSON file that is being output could be done a bit better in terms of key names.

[x] it would be nice to have the scraper eventually pull some description data for the each individual exercise this would require a bit more work and currently it is not needed for that i needed this scraper for.

## Bugs

- 'Popliteus' in calves also not being parsed properly. Mainly because it doesnt have its own exercises, only "see more" (exercises that have it as the auxilary muscle)

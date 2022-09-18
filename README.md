# exrx-scraper

This is a scraper for the exercises directory of Exrx.net.
It is made using puppeteer(a headless chromium browser) ontop of javascript.

## Requirements

- Node v18
- run npm install

## about

The original that this was forked from was incomplete (would not pull deeper than the name of the muscle groups), this is my work on completing it.

- Run using `npm run main`
- This will create a data.json with exercises of Exrx.net

### Todo

- Triply nested exercise variants are not being retrieved properly however the logic is there to easily fix when i get the opportunity
- The organization of the JSON file that is being output could be done a bit better in terms of key names.

- **in progress**: it would be nice to have the scraper eventually pull some description data for the each individual exercise this would require a bit more work and currently it is not needed for that i needed this scraper for.

## Bugs

- Hip Abductors not being picked up
- Some header names not getting picked up (General Back, Supraspinatus, Hip Flexors, Hip Adductors etc)
- Some links are not being picked up (when they contain nested UL only)
- 'Popliteus' in calves also not being parse properly

# exrx-scraper
This is a scraper for the exercises directory of Exrx.net.
It is made using puppeteer(a headless chromium browser) ontop of javascript. 

## about
The original that this was forked from was incomplete (would not pull deeper than the name of the muscle groups), this is my work on completeting it.

- Run using `node index`
- This will create a json with exercises of Exrx.net


### Todo:
- Tripply nested exercise variants are not being retrieved properly however the logic is there to easily fix when i get the opertunity
- The organization of the JSON file that is being output could be done a bit better in terms of key names.
- add unecessary test files to .gitignore to clean up the repo.
- __future__: it would be nice to have the scraper eventually pull some description data for the each individual exercise this would require a bit more work and currently it is not needed for that i needed this scraper for. 


import puppeteer from 'puppeteer';

// import axios
type BodyParts = {
    name: string,
    href: string,
    muscles?: any[]
}
export const getBodyParts = async () => {
    let data: BodyParts[] = [];
    let dir_url = "https://exrx.net/Lists/Directory";

    // let res = await fetch("https://exrx.net/Lists/Directory")
    // let root = parse(await res.text());

    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(dir_url);
    console.log("getting body parts and links");
    let bodypart_list_items = await page.$$eval(".row > .col-sm-6 > ul > li",
        (items) => {
            data = [] as BodyParts[];
            items.map(li => {
                let anchor = li.querySelector("a");
                if (!anchor) {
                    // console.log("anchor not found for li element. skipping");
                    throw ("anchor not found for li element:  " + li.innerHTML);
                }
                // turn anchor into node element    
                let name = anchor.text
                let href = anchor.href;

                // if (!href.includes("https")) {
                //     href = base_url  + href;
                // }
                if (!href) {
                    throw "href not found for anchor element in bodypart " + name;
                }
                data.push({
                    name,
                    href,
                })
            })
            return data;
        });
    console.log(bodypart_list_items)
    browser.close();

    return bodypart_list_items;
}

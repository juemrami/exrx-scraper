import puppeteer from 'puppeteer';
import { parse } from 'node-html-parser';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

type _ = {
    name: string,
    links: [name: string, href: string][]
    exercises: any[]
}
type x = {
    name: string,
    links: [name: string, href: string][]
    exercises: string
}
export const getMuscles = async (body_part_url: string) => {
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    console.log(body_part_url);
    await page.goto(body_part_url);
    console.log("getting muscles and links");
    let muscle_headers = await page.$$eval(".col-sm-12 > h2", (headers) => {
        let exceptions = [
            "General Back"
        ]
        return headers.map(header => {
            let name = header.textContent;
            let links = [] as [name: string, href: string][];
            let anchors = header.querySelectorAll("a");
            anchors.forEach(anchor => {
                let href = anchor.href;
                let name = anchor.text;
                // hack for empty A tags used in headers by EXRX
                if (href && name) {
                    links.push([
                        name,
                        href
                    ])
                }
            });
            if (!name) {
                throw "name not found for muscle header element" + header.innerHTML + " in body part " + header.baseURI;
            }
            return {
                name,
                links,
                exercises: [],
            }
        })
    });

    console.dir(muscle_headers, { depth: null });
    browser.close();
    return muscle_headers
}
export const alt_method = async (body_part_url: string) => {
    const html = await fetch(body_part_url);
    const root = parse(await html.text());
    let muscle_headers = root.querySelectorAll(".col-sm-12 > h2");
    let data = [] as _[];
    let exceptions = [
        "General Back"
    ]
    console.log(html.url);
    muscle_headers.forEach(header => {
        let name = header.textContent;
        let links = [] as [name: string, href: string][];
        let anchors = header.querySelectorAll("a");
        anchors.forEach(anchor => {
            let href = anchor.attributes.href;
            let name = anchor.text;
            // hack for empty A tags used in headers by EXRX
            if (href && name) {
                links.push([
                    name,
                    path.posix.join(body_part_url, "../", href).toString()
                ])
            }
        });
        if (!name) {
            throw "name not found for muscle header element" + header.innerHTML + " in body part " + body_part_url;
        }
        data.push({
            name,
            links,
            exercises: [] as any[],
        })
    })
    return data;
}
export const withExercises = async (body_part_url: string) => {
    // using chrome desktop user agent with js enabled


    const res = await fetch(body_part_url, {
        window: null,
        keepalive: true,
        method: 'GET',
        redirect: 'follow'
    })



    // let { data: html, } = await axios.get(body_part_url, { responseType: "text" })
    const html = await res.text();
    const root = parse(html);
    let muscle_headers = root.querySelectorAll(".col-sm-12 > h2");
    let data = [] as x[];
    let exceptions = [
        "General Back"
    ]
    // html.body?.pipeTo(fs.createWriteStream("test.html"))
    console.log(body_part_url);
    if (body_part_url === "https://exrx.net/Lists/ExList/ForeArmWt") {
        await fs.writeFileSync("exrx.html", html);

        console.log('headrs', res.headers);

        debugger;
    }
    muscle_headers.forEach(header => {
        let name = header.textContent;
        let links = [] as [name: string, href: string][];
        let anchors = header.querySelectorAll("a");
        anchors.forEach(anchor => {
            let href = anchor.attributes.href;
            let name = anchor.text;
            // hack for empty A tags used in headers by EXRX
            if (href && name) {
                links.push([
                    name,
                    path.posix.join(body_part_url, "../", href).toString()
                ])
            }
        });
        if (!name) {
            throw "name not found for muscle header element" + header.innerHTML + " in body part " + body_part_url;
        }
        data.push({
            name,
            links,
            exercises: '',
        })

    })

    let container_divs = root.querySelectorAll("article > .container");
    for (let i = 0; i < container_divs.length; i++) {
        let header = container_divs[i].querySelector("h2");
        if (header) {
            let name = header.textContent;
            i++;
            let exercise_html = container_divs[i].toString();
            // insert into data where name matches
            let index = data.findIndex(datum => datum.name === name);
            if (index === -1) {
                throw "could not find muscle header for exercise " + name;
            }
            if (!exercise_html) {
                throw "could not find exercise html for " + name;
            }
            data[index].exercises = exercise_html;
            // fs.writeFileSync(`./test/container_divs_${name}.html`, header.toString() + exercise_html);
        }
    };
    // console.log(data);
    return data


}
import { parse } from 'node-html-parser';
import { load } from 'cheerio';

type ExrxMuscle = {
    name: string,
    links: [name: string, href: string][]
    exercisesHTML: string
    exercises?: any[]
}
export const getMusclesWithExerciseHtml = async (body_part_url: string) => {
    // using chrome desktop user agent with js enabled
    const res = await fetch(body_part_url, {
        method: 'GET',
        redirect: 'follow'
    })
    const html = await res.text();
    // const root = parse(html);
    const root = parse(load(html).html());
    let muscle_headers = root.querySelectorAll(".col-sm-12 > h2");
    let data = [] as ExrxMuscle[];
    let exceptions = [
        "General Back"
    ]
    console.log(body_part_url);
    // if (body_part_url === "https://exrx.net/Lists/ExList/ForeArmWt") {
    //     fs.writeFileSync("_test.html", html);
    //     debugger;
    // }
    muscle_headers.forEach(header => {
        let name = header.textContent;
        let links = [] as [name: string, href: string][];
        let anchors = header.querySelectorAll("a");
        anchors.forEach(anchor => {
            let href = anchor.attributes.href;
            let name = anchor.text;
            // hack for empty A tags used in headers by EXRX
            (!href || href.includes("http")) || (href = new URL("../" + href, body_part_url).href);
            if (href && name) {
                links.push([
                    name,
                    href
                ])
            }
        });
        if (!name) {
            throw "name not found for muscle header element" + header.innerHTML + " in body part " + body_part_url;
        }
        data.push({
            name,
            links,
            exercisesHTML: '',
        })

    })

    let container_divs = root.querySelectorAll("article > .container");
    for (let i = 0; i < container_divs.length; i++) {
        let header = container_divs[i].querySelector("h2");
        if (header) {
            let name = header.textContent;
            // console.log(name)
            // if (name === "Wrist Flexors") debugger;
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
            data[index].exercisesHTML = exercise_html;
            // fs.writeFileSync(`./test/container_divs_${name.replace(" ", '_')}.html`, header.toString() + exercise_html);
        }
    };
    // console.log(data);
    return data


}
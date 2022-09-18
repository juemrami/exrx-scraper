import { load } from "cheerio";
import parse from "node-html-parser";
import { HTMLElement } from "node-html-parser";
import { question } from "readline-sync";
import { URL } from "node:url";
import * as readlineSync from "readline-sync";


type ExerciseExercise = {
    name: string;
    href?: string;
    data?: ExerciseData;
    is_variant: boolean;
    variants?: ExerciseExercise[];
}
export type ExrxEquipment = {
    equipment: string;
    exercises: ExerciseExercise[];
}
type ExerciseData = {
    classification: {
        force?: string;
        mechanics?: string;
        utility?: string;
    };
    muscles: {
        target?: [string];
        synergist?: [string];
    };
    instructions: {
        preparation?: string;
        execution?: string;
    };
    mp4?: string;
    vimeoUrl?: string;
    comments?: string;
}

const getNestedExercises = (root: HTMLElement, is_variant: boolean) => {
    const base_url = "https://exrx.net/Lists/ExList"
    let exercise: ExerciseExercise;
    let direct_li_children = root.querySelectorAll(":scope > ul > li");
    let exercise_name = root.firstChild.textContent
    let href = root.querySelector("a")?.getAttribute("href");
    (!href || href.includes("http")) || (href = new URL(href, base_url).href);
    if (!href) {
        console.log("href not found for exercise: " + name);
        console.log("continue?");
        let answer = question("y/n: ");
        if (answer === "n") throw "user aborted";
    }
    let variants = [] as ExerciseExercise[];
    direct_li_children.forEach(li => {
        variants.push(getNestedExercises(li, true));
    });
    exercise = {
        name: exercise_name,
        href,
        is_variant,
        variants
    }
    return exercise;

}
export const getExercises = async (muscleHTML: string) => {
    let dom = parse(muscleHTML);
    let equipment_list_items = dom.querySelectorAll(".col-sm-6 > ul > li");

    if (!equipment_list_items) {
        throw "exercises not found for muscle " + muscleHTML;
    }
    let data = [] as ExrxEquipment[];
    let related_muscles = [];
    for (let i = 0; i < equipment_list_items.length; i++) {
        let li = equipment_list_items[i];
        if (!li.querySelector("ul")) {
            // this is the "see more" content
            // in the future, we can scrape this too
            console.log("weird equipment found: " + li.firstChild.textContent);
            // related_muscles.push(li.firstChild.textContent);
            continue;
        }
        let equipment = li.firstChild.textContent;
        let exercises = [] as ExerciseExercise[];

        let exercise_children = li.querySelectorAll(":scope > ul > li");
        exercise_children.forEach(child => {
            let exercise = getNestedExercises(child, false);
            exercises.push(exercise);
        });

        let get_exercise_data = async (curr_exercise: ExerciseExercise) => {
            if (curr_exercise.variants) {
                let res = [] as Promise<ExerciseData | undefined>[];
                for (let i = 0; i < curr_exercise.variants.length; i++) {
                    res[i] = get_exercise_data(curr_exercise.variants[i]);
                }
                let vars_data = await Promise.all(res);
                curr_exercise.variants.forEach((variant, i) => {
                    variant.data = vars_data[i];
                });

            }
            if (curr_exercise.href) {
                let exercise_data = await getExerciseData(curr_exercise.href);
                curr_exercise.data = exercise_data;
            }
            return curr_exercise.data;
        }
        let exercises_data = [] as Promise<ExerciseData | undefined>[];
        for (let j = 0; j < exercises.length; j++) {
            if (exercises[j].href) {
                exercises_data[j] = get_exercise_data(exercises[j]);
            }
        }
        let exercises_data_res = await Promise.all(exercises_data);
        exercises.forEach((exercise, i) => {
            exercise.data = exercises_data_res[i];
        });

        if (exercises.length === 0) {
            throw ("!no exercises found for equipment: " + equipment + " -- inspect");
            // continue;
        }

        data.push({
            equipment,
            exercises,
        })
    }
    // console.log(data);
    return data;
}
export const getExerciseData = async (exercise_url: string | null) => {
    console.log("getting exercise data for: " + exercise_url);

    let parsedData: ExerciseData = {
        classification: {},
        instructions: {},
        muscles: {},
        comments: undefined,
        mp4: undefined,
        vimeoUrl: undefined,
    };
    if (exercise_url) {
        let page = await (
            await fetch(exercise_url, {
                headers: {
                    Cookie:
                        "_ga=GA1.2.122195374.1654023015; _gid=GA1.2.371181797.1654023015; ezds=ffid%3D1%2Cw%3D1920%2Ch%3D1080; _pbjs_userid_consent_data=3524755945110770; __qca=P0-1803175704-1654023020023; __gads=ID=50d18598d9be51a4:T=1654023816:S=ALNI_MZNN-Oj_aLzskDVPMTaPJorT7zaXw; __gpi=UID=000005fbeccab4b1:T=1654023816:RT=1654064582:S=ALNI_MbO8JEuKFJO3G1LMzTJsBoS_WTbqA; cto_bundle=KGVl3V9ZNlE2QUpnOVJkZ3hNM0Q4Y1hGQ1h1ZFAlMkJLWnlyVkNFQUlRJTJCS0JJbTVMZkFtaTlvd3JPYnglMkZHTnpKZmFzV2NjYVVUQkRIJTJCckI0ME1KWHh4QTFVJTJGM2FEYTZkOHVEbE5aNEJtbmtEWTdQbUhpM2hYbUtvYVV3WEY1cUE3RDdNMmFaM0tjT1h3ZFliZVRUJTJGVHlVdEFuMlElM0QlM0Q; cto_bidid=DdJAvV90bGNUUzFsOWwlMkZsTyUyRnF1T2FDY2dsbERadDZTdXlrejVCY3BDUm1OdEM4TWR3UTlwd3czQjlOSlFjM092ZDVGRXFnJTJCWUhyMTd4eHc4bGxtdmlRVDJBZ3F4UmFKQmdRaXEyTER6TW5KUGpiZyUzRA; ezohw=w%3D1764%2Ch%3D269; ezepvv=401; ezosuibasgeneris-1=0ad9a599-ab57-47e3-5cec-a6a52261a87c; active_template::107151=pub_site.1654067241; ezovuuidtime_107151=1654067243; ezux_lpl_107151=1654067305144|8db9c145-d6f0-4a6d-5f0f-5cfc5fce31e3|false",
                    Referer: "https://exrx.net/",
                },
            })
        ).text();
        let _ = load(page).html();
        if (!page) {
            console.log(`Trouble grabbing html from ${exercise_url}`);
            // readlineSync.question("continue?");
            if (readlineSync.keyInYN("continue?")) {
                return;
            }
        }
        let document = parse(_);
        let infoSections = {};

        document.querySelectorAll(".ad-banner-block h2").forEach(h2 => {
            infoSections[h2.innerText.toLowerCase().trim()] = {};
            let header_value = h2.innerText.toLowerCase().trim()
            h2.setAttribute("id", header_value);
        });
        for (const section_name in infoSections) {

            let res: any;
            // console.log(`${section_name}:`);
            switch (section_name) {
                case "instructions":
                    res = parseInstructions(document);
                    // console.log(res);
                    parsedData.instructions = res;
                    break;
                case "classification":
                    res = parseClassification(document.querySelector(`#${section_name}`));
                    // console.log(res);
                    parsedData.classification = res;
                    break;
                case "muscles":
                    res = parseMuscles(document.querySelector(`#${section_name}`));
                    // console.log(res);
                    parsedData.muscles = res;
                    break;
                case "comments":
                    let h2 = document.querySelector(`#${section_name}`)
                    if (!h2 || !h2.nextElementSibling) debugger;
                    let comments = h2!.nextElementSibling.textContent
                    // console.log(comments);
                    parsedData.comments = comments;
                    break;
                default:
                    break;
            }
        }
        // debugger;
        let url = findVimeoUrl(page);
        parsedData.vimeoUrl = url;
        // debugger;
        let mp4 = await getMp4(url);
        parsedData.mp4 = mp4;
    } else {
        console.log("No href found, skipping exercise");
    }
    // console.log(parsedData);
    return parsedData;


    function parseInstructions(document: HTMLElement): ExerciseData["instructions"] {
        let instructions = {
            preparation: "",
            execution: "",
        };
        // debugger;
        // p_siblings.forEach((p, i) => {
        //     let is_prev_p = p.previousElementSibling?.tagName === "P";
        //     let prev_id = p.previousElementSibling?.id;
        //     let is_okay = false;
        //     if (is_prev_p) is_okay = true;
        //     else if (prev_id == "instructions") is_okay = true;
        //     else is_okay = false;

        //     is_okay && target_p_tags.push(p.textContent?.toLowerCase().trim() || "");
        // })

        let p_siblings = document.querySelectorAll("#instructions ~ p").slice(0, 4);
        let target_p_tags = p_siblings
            // if prev element not a p tag, and not an h2 tag with id of instructions
            .filter(p => {
                let is_prev_p = p.previousElementSibling?.tagName === "P";
                let prev_id = p.previousElementSibling?.id;
                let is_okay = false;
                if (is_prev_p) is_okay = true;
                else if (prev_id == "instructions") is_okay = true;
                else is_okay = false;

                return is_okay;
            })
            .map(p => p.textContent?.toLowerCase().trim() || "")
        // console.log('p', p_siblings);

        target_p_tags[0] == "preparation" ? (instructions.preparation = target_p_tags[1]) : {};
        target_p_tags[2] == "execution" ? (instructions.execution = target_p_tags[3]) : {};
        if (target_p_tags.length > 5 || target_p_tags.length == 0) {
            console.log("no_tags or too many")
            debugger
        };
        return instructions;
    }
    function parseMuscles(htmlElement: any): ExerciseData["muscles"] {
        let muscles = {
            target: undefined,
            synergists: undefined,
        };

        const targetElement = htmlElement.nextElementSibling;
        const cycleSiblings = (element: Element | null, res: any[]) => {
            if (!element) {
                return res;
            }
            const tag = element.tagName;
            if (tag === "UL") {
                const li_tags = element.querySelectorAll("li");
                let items = [] as string[];
                li_tags.forEach((li) => {
                    let text = li.textContent?.toLowerCase().trim() || "";
                    text && text !== "none" && items.push(text);
                });
                res.push(items);
                cycleSiblings(element.nextElementSibling, res);
            }
            if (tag === "P") {
                res.push(element.textContent?.toLowerCase().trim());
                cycleSiblings(element.nextElementSibling, res);
            }
            return res;
        };
        // debugger;
        const items = cycleSiblings(targetElement, []);
        for (const idx in items) {
            switch (items[idx]) {
                case "target":
                    muscles.target = items[Number(idx) + 1];
                    break;
                case "synergists":
                    muscles.synergists = items[Number(idx) + 1];
                    break;
                default:
                    break;
            }
        }
        return muscles;
    }
    function parseClassification(htmlElement: any): ExerciseData["classification"] {
        const targetElement: HTMLElement = htmlElement.nextElementSibling;
        let classification = {
            force: undefined,
            mechanics: undefined,
            utility: undefined,
        };
        // debugger;
        const tableRows = targetElement.parentNode.querySelectorAll("table tr");
        for (const tr in tableRows) {
            const text = tableRows[tr].textContent.toLowerCase().trim();
            const strings = text.split(":");
            if (classification[strings[0]] === undefined) {
                classification[strings[0].trim()] = strings[1].trim();
            }
        }
        return classification;
    }
    async function getMp4(url): Promise<any> {

        if (!url) return undefined;
        // debugger
        var config = {
            method: "get",
            headers: {
                Cookie:
                    'vuid=pl611761060.2142071653; player=""; __cf_bm=h_SUYmE1jK2NumS3_Sj3Lo1HHLvE9lYYFE1w0ZnAgss-1654026332-0-AcPQKPNAi6gP6rR1/i5DpvuEIzVCaPLDbVQm7QEgvRWYuQHChWEl63GqShV+dc0bw+sdRACAul6neZvzWLhVSec=; __cf_bm=4Br2yvmrLxJFFYjGM4geHOhwp54NIsPNWuNZuTJyxrA-1654030279-0-AWMse5rVgWD3MAeK+asiGOllHnJkk+jxe5XHyu802nVsHDZ6yO+vANJ6FOz+99RW6wbanHm1wjRPARPpJvjyz34=',
                "Sec-Fetch-Dest": "iframe",
                Referer: "https://exrx.net/",
            },
        };
        const page = await (await fetch(url, config)).text();
        let targetText = /"progressive":\[\{[^\]]*\},*\]/.exec(page);
        if (!targetText?.[0]) return undefined;
        // debugger
        let cdnObject = JSON.parse(targetText[0].replace('"progressive":', ""));
        let mp4url = cdnObject.pop().url;
        return /\.mp4/.test(mp4url) ? mp4url : undefined;
    }
    function findVimeoUrl(docText: string): string | undefined {
        const urls = /<iframe.*src=.*vimeo.*<\/iframe>/.exec(docText);
        if (!urls || urls?.length > 1) {
            // debugger;
            console.log("No vimeo url found");
            return undefined;
        }
        // console.log(urls);
        const src = urls[0]?.split('src="')[1].split('"')[0] || undefined;
        // console.log(src);
        // debugger;
        return src;
    }


}
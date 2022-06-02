import { readFile, readFileSync, writeFileSync } from "fs";
import { parse } from "node-html-parser";
import * as fetch from "node-fetch";
import { url } from "inspector";

interface Exercise {
  name: string;
  href?: string;
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

const data = readFileSync("output_1.json", { encoding: "utf-8" });

async function Main() {
  console.log("Starting Exercise Data Parse\n--------------------------------");
  let json = JSON.parse(data);
  for (const muscleGroup in json) {
    for (const muscle_name in json[muscleGroup].muscles) {
      for (const equipment_name in json[muscleGroup].muscles[muscle_name]) {
        for await (let exercise of json[muscleGroup].muscles[muscle_name][
          equipment_name
        ]) {
          debugger;
          console.log(`exercise:${[...exercise]}`);
          const name = exercise.name;
          let href = exercise.href;
          let exerciseData: Exercise = {
            name: name,
            href: href,
            classification: {},
            instructions: {},
            muscles: {},
            comments: undefined,
            mp4: undefined,
            vimeoUrl: undefined,
          };
          if (href) {
            let page = await (
              await fetch.default(href, {
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36",
                  Referer: "https://exrx.net/",
                },
              })
            ).text();
            if (!page) {
              console.log(`Trouble grabbing html from ${href}`);
              exercise = exerciseData;
              continue;
            }
            let document = parse(page);
            let infoSections = {};
            const headers = document.querySelectorAll(".ad-banner-block h2");
            debugger;
            for (const h2 of headers) {
              console.log(h2.innerText.toLowerCase().trim());
              infoSections[h2.innerText.toLowerCase().trim()] = {};
              infoSections[h2.innerText.toLowerCase().trim()]["htmlElement"] =
                h2;
            }

            for (const section_name in infoSections) {
              const element = infoSections[section_name]["htmlElement"];
              let res: any;
              switch (section_name) {
                case "instructions":
                  res = parseInstructions(element);
                  console.log(res);
                  exerciseData.instructions = res;
                  break;
                case "classification":
                  res = parseClassification(element);
                  console.log(res);
                  exerciseData.classification = res;
                  break;
                case "muscles":
                  res = parseMuscles(element);
                  console.log(res);
                  exerciseData.muscles = res;
                  break;
                case "comments":
                  exerciseData.comments =
                    infoSections[
                      section_name
                    ].htmlElement.nextElementSibling.textContent;
                  break;
                default:
                  break;
              }
            }
            debugger;
            let url = findVimeoUrl(page);
            let mp4 = await getMp4(url);
            exerciseData.vimeoUrl = url;
            exerciseData.mp4 = mp4;
          } else {
            console.log("No href found, skipping exercise");
          }
          console.log(exerciseData);
          exercise = exerciseData;
        }
      }
    }
  }
  debugger;
  return json;
}

function parseInstructions(htmlElement: any): Exercise["instructions"] {
  let instructions = {
    preparation: "",
    execution: "",
  };
  const getnextP = (htmlElement: Element, res: string[]) => {
    if (!htmlElement) {
      return res;
    }
    const tag = htmlElement.tagName;
    if (tag === "H2") {
      getnextP(htmlElement.nextElementSibling, res);
    }
    if (tag === "P") {
      res.push(htmlElement.textContent.toLowerCase().trim());
      getnextP(htmlElement.nextElementSibling, res);
    }
    return res;
  };
  debugger;
  const p_tags = getnextP(htmlElement.nextElementSibling, []);
  p_tags[0] == "preparation" ? (instructions.preparation = p_tags[1]) : {};
  p_tags[2] == "execution" ? (instructions.execution = p_tags[3]) : {};
  return instructions;
}
function parseMuscles(htmlElement: any): Exercise["muscles"] {
  let muscles = {
    target: undefined,
    synergists: undefined,
  };

  const targetElement = htmlElement.nextElementSibling;
  const cycleSiblings = (element: Element, res: any[]) => {
    if (!element) {
      return res;
    }
    const tag = element.tagName;
    if (tag === "UL") {
      const li_tags = element.querySelectorAll("li");
      let items = [];
      li_tags.forEach((li) => {
        const text = li.textContent.toLowerCase().trim();
        items.push(text === "none" ? undefined : text);
      });
      res.push(items);
      cycleSiblings(element.nextElementSibling, res);
    }
    if (tag === "P") {
      res.push(element.textContent.toLowerCase().trim());
      cycleSiblings(element.nextElementSibling, res);
    }
    return res;
  };
  debugger;
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
function parseClassification(htmlElement: any): Exercise["classification"] {
  const targetElement: HTMLElement = htmlElement.nextElementSibling;
  let classification = {
    force: undefined,
    mechanics: undefined,
    utility: undefined,
  };
  debugger;
  const tableRows = targetElement.parentNode.querySelectorAll("table tr");
  for (const tr in tableRows) {
    const text = tableRows[tr].textContent.toLowerCase().trim();
    const strings = text.split(":");
    debugger;
    if (classification[strings[0]] === undefined) {
      classification[strings[0].trim()] = strings[1].trim();
    }
  }
  return classification;
}
async function getMp4(url): Promise<any> {
  if (!url) return undefined;
  var config = {
    method: "get",
    // url: "https://player.vimeo.com/video/156565479?muted=1&autoplay=1&loop=1&title=0&byline=0&portrait=0",
    headers: {
      Cookie:
        'vuid=pl611761060.2142071653; player=""; __cf_bm=h_SUYmE1jK2NumS3_Sj3Lo1HHLvE9lYYFE1w0ZnAgss-1654026332-0-AcPQKPNAi6gP6rR1/i5DpvuEIzVCaPLDbVQm7QEgvRWYuQHChWEl63GqShV+dc0bw+sdRACAul6neZvzWLhVSec=; __cf_bm=4Br2yvmrLxJFFYjGM4geHOhwp54NIsPNWuNZuTJyxrA-1654030279-0-AWMse5rVgWD3MAeK+asiGOllHnJkk+jxe5XHyu802nVsHDZ6yO+vANJ6FOz+99RW6wbanHm1wjRPARPpJvjyz34=',
      "Sec-Fetch-Dest": "iframe",
      Referer: "https://exrx.net/",
      Connection: "close",
    },
  };
  debugger;

  const page = await (await fetch.default(url)).text();
  let targetText = /"progressive":\[\{.*\},*\]/.exec(page);
  // const document = parse(page);
  debugger;
  if (!targetText[0]) return;

  let cdnObject = JSON.parse(targetText[0].replace('"progressive":', ""));
  let mp4url = cdnObject.pop().url;
  return /\.mp4/.test(mp4url) ? mp4url : undefined;
}

// write to output_2.json
//   await writeFile("output_2.json", JSON.stringify(exercise_data));
(async () => {
  const outData = await Main();
  writeFileSync("output_2.json", JSON.stringify(outData));
})();
function findVimeoUrl(docText: string): string | undefined {
  const urls = /<iframe.*src=.*vimeo.*<\/iframe>/.exec(docText);
  if (urls.length > 1) {
    debugger;
  }
  // console.log(urls);
  const src = urls[0]?.split('src="')[1].split('"')[0] || undefined;
  console.log(src);
  debugger;
  return src;
}

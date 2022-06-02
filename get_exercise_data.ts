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
        for (let exercise_idx in json[muscleGroup].muscles[muscle_name][
          equipment_name
        ]) {
          let exercise =
            json[muscleGroup].muscles[muscle_name][equipment_name][
              exercise_idx
            ];
          // debugger;
          console.log(`exercise:${(exercise.name, exercise.href)}`);
          const name = exercise.name;
          let href = exercise.href;
          let parsedData: Exercise = {
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
                  Cookie:
                    "_ga=GA1.2.122195374.1654023015; _gid=GA1.2.371181797.1654023015; ezds=ffid%3D1%2Cw%3D1920%2Ch%3D1080; _pbjs_userid_consent_data=3524755945110770; __qca=P0-1803175704-1654023020023; __gads=ID=50d18598d9be51a4:T=1654023816:S=ALNI_MZNN-Oj_aLzskDVPMTaPJorT7zaXw; __gpi=UID=000005fbeccab4b1:T=1654023816:RT=1654064582:S=ALNI_MbO8JEuKFJO3G1LMzTJsBoS_WTbqA; cto_bundle=KGVl3V9ZNlE2QUpnOVJkZ3hNM0Q4Y1hGQ1h1ZFAlMkJLWnlyVkNFQUlRJTJCS0JJbTVMZkFtaTlvd3JPYnglMkZHTnpKZmFzV2NjYVVUQkRIJTJCckI0ME1KWHh4QTFVJTJGM2FEYTZkOHVEbE5aNEJtbmtEWTdQbUhpM2hYbUtvYVV3WEY1cUE3RDdNMmFaM0tjT1h3ZFliZVRUJTJGVHlVdEFuMlElM0QlM0Q; cto_bidid=DdJAvV90bGNUUzFsOWwlMkZsTyUyRnF1T2FDY2dsbERadDZTdXlrejVCY3BDUm1OdEM4TWR3UTlwd3czQjlOSlFjM092ZDVGRXFnJTJCWUhyMTd4eHc4bGxtdmlRVDJBZ3F4UmFKQmdRaXEyTER6TW5KUGpiZyUzRA; ezohw=w%3D1764%2Ch%3D269; ezepvv=401; ezosuibasgeneris-1=0ad9a599-ab57-47e3-5cec-a6a52261a87c; active_template::107151=pub_site.1654067241; ezovuuidtime_107151=1654067243; ezux_lpl_107151=1654067305144|8db9c145-d6f0-4a6d-5f0f-5cfc5fce31e3|false",
                  Referer: "https://exrx.net/",
                },
              })
            ).text();
            if (!page) {
              console.log(`Trouble grabbing html from ${href}`);
              json[muscleGroup].muscles[muscle_name][equipment_name][
                exercise_idx
              ] = parsedData;
              continue;
            }
            let document = parse(page);
            let infoSections = {};
            const headers = document.querySelectorAll(".ad-banner-block h2");
            // debugger;

            for (const h2 of headers) {
              infoSections[h2.innerText.toLowerCase().trim()] = {};
              infoSections[h2.innerText.toLowerCase().trim()]["htmlElement"] =
                h2;
            }

            for (const section_name in infoSections) {
              const element = infoSections[section_name]["htmlElement"];
              let res: any;
              console.log(`${section_name}:`);
              switch (section_name) {
                case "instructions":
                  res = parseInstructions(element);
                  console.log(res);
                  parsedData.instructions = res;
                  break;
                case "classification":
                  res = parseClassification(element);
                  console.log(res);
                  parsedData.classification = res;
                  break;
                case "muscles":
                  res = parseMuscles(element);
                  console.log(res);
                  parsedData.muscles = res;
                  break;
                case "comments":
                  parsedData.comments =
                    infoSections[
                      section_name
                    ].htmlElement.nextElementSibling.textContent;
                  break;
                default:
                  break;
              }
            }
            // debugger;
            let url = findVimeoUrl(page);
            let mp4 = await getMp4(url);
            parsedData.vimeoUrl = url;
            parsedData.mp4 = mp4;
          } else {
            console.log("No href found, skipping exercise");
          }
          console.log(parsedData);
          json[muscleGroup].muscles[muscle_name][equipment_name][exercise_idx] =
            parsedData;
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
  // debugger;
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
function parseClassification(htmlElement: any): Exercise["classification"] {
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
  var config = {
    method: "get",
    headers: {
      Cookie:
        'vuid=pl611761060.2142071653; player=""; __cf_bm=h_SUYmE1jK2NumS3_Sj3Lo1HHLvE9lYYFE1w0ZnAgss-1654026332-0-AcPQKPNAi6gP6rR1/i5DpvuEIzVCaPLDbVQm7QEgvRWYuQHChWEl63GqShV+dc0bw+sdRACAul6neZvzWLhVSec=; __cf_bm=4Br2yvmrLxJFFYjGM4geHOhwp54NIsPNWuNZuTJyxrA-1654030279-0-AWMse5rVgWD3MAeK+asiGOllHnJkk+jxe5XHyu802nVsHDZ6yO+vANJ6FOz+99RW6wbanHm1wjRPARPpJvjyz34=',
      "Sec-Fetch-Dest": "iframe",
      Referer: "https://exrx.net/",
      Connection: "close",
    },
  };
  // debugger;

  const page = await (await fetch.default(url, config)).text();
  let targetText = /"progressive":\[\{[^\]]*\},*\]/.exec(page);
  // const document = parse(page);
  // debugger;
  if (!targetText[0]) return undefined;

  let cdnObject = JSON.parse(targetText[0].replace('"progressive":', ""));
  let mp4url = cdnObject.pop().url;
  return /\.mp4/.test(mp4url) ? mp4url : undefined;
}

// write to output_2.json
//   await writeFile("output_2.json", JSON.stringify(exercise_data));
(async () => {
  const outData = await Main();
  writeFileSync(`${process.cwd()}\\output_2.json`, JSON.stringify(outData));
})();
function findVimeoUrl(docText: string): string | undefined {
  const urls = /<iframe.*src=.*vimeo.*<\/iframe>/.exec(docText);
  if (urls?.length > 1 || !urls) {
    // debugger;
    console.log("No vimeo url found");
    return undefined;
  }
  // console.log(urls);
  const src = urls[0]?.split('src="')[1].split('"')[0] || undefined;
  console.log(src);
  // debugger;
  return src;
}

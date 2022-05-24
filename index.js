// BUGS
// Inside of shoulders. seems like were picking up 1 too many headers. should only have 8 and have 9
// INside of supraspinatis in shoulders. theres a weird edge case to fix with a blank #text element

const puppeteer = require("puppeteer");
// import Date
const fs = require("fs");
(async () => {
  const finalData = [];
  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      slowMo: 50,
    });
    const page = await browser.newPage();

    await page.goto("https://exrx.net/Lists/Directory", {
      waitUntil: "domcontentloaded",
    });
    // create an object for each of the major muscle groups on the site
    // object includes name, href, and an object.
    const muscleGroups = await page.evaluate(() => {
      const muscleGroupDomElements = document.querySelectorAll(
        ".col-sm-6 > ul > li > a"
      );

      const subMuscleDomElements = document.querySelectorAll(
        ".col-sm-6 > ul > li"
      );

      const data = [];
      for (let i = 0; i < muscleGroupDomElements.length; i++) {
        let muscleArray = subMuscleDomElements[i].innerText.split("\n");

        // remove first entry as it repeats the name itself
        muscleArray.shift();

        data.push({
          name: muscleGroupDomElements[i].innerText,
          href: muscleGroupDomElements[i].href,
          muscles: new Object(),
        });
      }
      return data;
    });
    {
      // document.querySelector() grabs a single element == await page.$
      // document.querySelectorAll() grabs many elements == await page.$$
      //await page.waitForSelector('.article')
      // using .article because that is the name of the CSS container in exrx website
      /*
                    To select using id — use ‘#’ and append id of the parent element.
                    To select using class —use ‘.’ and append class of the parent element. 
                    */
    }
    for (let i = 0; i < muscleGroups.length; i++) {
      await page.goto(muscleGroups[i].href, { waitUntil: "domcontentloaded" });
      let muscleGroupData = await page.evaluate(() => {
        const muscleContainers = document.querySelectorAll(
          "#mainShell > article > .container > .row > .col-sm-12"
        );
        let Muscles = [];
        const MuscleMap = new Map();
        muscleContainers.forEach((container, index) => {
          let excerciseTypeMap = new Map();

          if (container.querySelector(".col-sm-6")) {
            console.log(container);
            const exerciseEquipmentVariantContainer =
              container.querySelectorAll(".col-sm-6 > ul > li");
            exerciseEquipmentVariantContainer.forEach((li) => {
              const li_children = li.childNodes;
              let textValueIndex = -1;
              do {
                textValueIndex++;
                currChild = li_children[textValueIndex];
              } while (currChild.nodeName != "#text");

              const listStartIndex = textValueIndex + 1;
              const typeName = li_children[textValueIndex].textContent;
              //IF MORE LISTS GO THROUGH ALL ELSE
              let excNames = [];
              const exNamesContainer = li_children[
                listStartIndex
              ].querySelectorAll(".col-sm-6 > ul > li > ul > li");
              exNamesContainer.forEach((e) => {
                //Check if variant even exists
                //Currently Not supported WIP

                // THIS IS JUST HERE BECAUSE EXRX FRONTEND DEVS ARE INCONSITENT
                // SOMETIMES STUFF ISNT NESTED NICELY
                // if ((e.childNodes[0].nodeName = "#text")) href = null;
                const cycleChildrenForHref = (node) => {
                  if (node.hasChildNodes() == false) return null;

                  if (node.childNodes[0].nodeName != "A") {
                    cycleChildrenForHref(node.childNodes[0]);
                  } else return node.childNodes[0].href;
                };

                if (e.childNodes[listStartIndex]) {
                  console.log(e.childNodes[listStartIndex]);
                  // const exVariantContainer = e.childNodes[listStartIndex].querySelectorAll('li')
                }
                console.log({
                  name: e.childNodes[0].textContent,
                  href: cycleChildrenForHref(e) || null,
                });
                excNames.push({
                  name: e.childNodes[0].textContent,
                  href: cycleChildrenForHref(e) || null,
                });
              });
              excerciseTypeMap.set(typeName, excNames);
            });
            Muscles.push("");
            MuscleMap.set(Muscles[index - 1].name, excerciseTypeMap);
          } else {
            //dealing with banner
            //names with & not supported WIP
            const muscle = container.querySelectorAll(
              "h2 > [href], h2 > [name]"
            );
            let name = "";
            muscle.forEach((item) => {
              if (name == "") {
                name = item.innerText;
              } else {
                name = name + " & " + item.innerText;
              }
            });
            Muscles.push({ name: name });
          }
        });
        function stringifyMap(myMap) {
          function selfIterator(map) {
            return Array.from(map).reduce((acc, [key, value]) => {
              if (value instanceof Map) {
                acc[key] = selfIterator(value);
              } else {
                acc[key] = value;
              }
              return acc;
            }, {});
          }
          const res = selfIterator(myMap);
          console.log(res);
          return res;
        }
        // debugger;
        console.log(MuscleMap);
        return stringifyMap(MuscleMap);
      });
      // debugger;
      muscleGroups[i].muscles = muscleGroupData;
      console.log(muscleGroups[i].name + " is okay");
      finalData.push(muscleGroups[i]);
    }
  } catch (e) {
    var jsonContent = JSON.stringify(finalData);
    fs.appendFile(
      `output-${new Date().toISOString()}.json`,
      jsonContent,
      "utf8",
      function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }

        console.log("JSON file has been saved.");
      }
    );
    console.log("our err", e);
  }
})();

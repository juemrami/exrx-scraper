// BUGS
// Inside of shoulders. seems like were picking up 1 too many headers. should only have 8 and have 9
// INside of supraspinatis in shoulders. theres a weird edge case to fix with a blank #text element

const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  const finalData = [];
  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      debuggingPort: 5500,
    });
    const page = await browser.newPage();

    await page.goto("https://exrx.net/Lists/Directory", {
      waitUntil: "domcontentloaded",
    });

    const musclesInMuscleGroup = {};
    const finalArr = [];
    const finalMap = new Map();

    const muscleGroups = await page.evaluate(() => {
      const groupMuscles = (muscle) => {
        let name = "";
        switch (muscle) {
          case "Anterior":
            name = "Deltoid - Anterior";
            break;
          case "Lateral":
            name = "Deltoid - Lateral";
            break;
          case "Posterior":
            name = "Deltoid - Posterior";
            break;
          case "Flexors":
            name = "Wrist - Flexors";
            break;
          case "Extensors":
            name = "Wrist - Extensors";
            break;
          case "Upper":
            name = "Trapezius - Upper";
            break;
          case "Middle":
            name = "Trapezius - Middle";
            break;
          case "Lower":
            name = "Trapezius - Lower";
            break;
          case "Sternal":
            name = "Pectoralis Major - Sternal";
            break;
          case "Clavicular":
            name = "Pectoralis Major - Clavicular";
            break;
          default:
            name = muscle;
            break;
        }
        return name;
      };
      const bodyPartsElements = document.querySelectorAll(
        ".col-sm-6 > ul > li > a"
      );

      const musclesElements = document.querySelectorAll(".col-sm-6 > ul > li");

      const data = [];
      for (let i = 0; i < bodyPartsElements.length; i++) {
        // muscles
        let muscleArray = musclesElements[i].innerText.split("\n");
        // remove first entry as it repeats the name itself
        muscleArray.shift();
        let muscleObjects = [];
        muscleArray.forEach((element) => {
          // non-clickable areas
          if (
            element !== "Deltoid" ||
            "Wrist" ||
            "Trapezius" ||
            "Pectoralis Major"
          ) {
            muscleObjects.push({ name: groupMuscles(element) });
          }
        });
        data.push({
          name: bodyPartsElements[i].innerText,
          href: bodyPartsElements[i].href,
          muscles: new Object(),
        });
      }
      return data;
    });
    {
      // document.querySelector() grabs a single element == await page.$
      // document.querySelectorAll() grabs many elements == await page.$$
      //await page.waitForSelector('.article')
      // using .article becase that is the name of the CSS container in exrx website
      /*
                    To select using id — use ‘#’ and append id of the parent element.
                    To select using class —use ‘.’ and append class of the parent element. 
                    */
    }
    for (let i = 0; i < muscleGroups.length; i++) {
      await page.goto(muscleGroups[i].href, { waitUntil: "domcontentloaded" });
      let muscleGroupData = await page.evaluate(() => {
        const siteDivContent = document.querySelectorAll(
          "#mainShell > article > .container > .row > .col-sm-12"
        );
        let Muscles = [];
        const MuscleMap = new Map();
        siteDivContent.forEach((container, index) => {
          let excerciseTypeMap = new Map();
          if (container.querySelector(".col-sm-6")) {
            console.log(container);
            const exerciseTypes = container.querySelectorAll(
              ".col-sm-6 > ul > li"
            );
            exerciseTypes.forEach((li) => {
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
                //Check if varriant even it exists
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
        debugger;
        console.log(MuscleMap);
        return stringifyMap(MuscleMap);
      });
      debugger;
      muscleGroups[i].muscles = muscleGroupData;
      console.log(muscleGroups[i].name + " is okay");
      finalData.push(muscleGroups[i]);
    }
  } catch (e) {
    var jsonContent = JSON.stringify(finalData);
    fs.writeFile("output_succesfull.json", jsonContent, "utf8", function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    });
    console.log("our err", e);
  }
})();

import fs from 'fs';
import { getBodyParts } from "./get/BodyParts";
import { getExercises, ExrxEquipment } from "./get/Exercises";
import { getMuscles, alt_method, withExercises } from "./get/Muscles";
import * as readlineSync from "readline-sync";
(async () => {
    let bodyParts = await getBodyParts();
    bodyParts = bodyParts.filter((bodyPart) => bodyPart.name != "Olympic-style Weightlifts")
    for await (let bodyPart of bodyParts) {
        let muscles = await withExercises(bodyPart.href);
        // console.dir(muscles, { depth: null });

        // if (bodyPart.name === "Forearms") debugger;

        // let exercises = [] as ExrxExercise[];
        for (let i = 0; i < muscles.length; i++) {
            console.log("looking at muscle: " + muscles[i].name);
            let e = await getExercises(muscles[i].exercisesHTML);
            muscles[i].exercises = e;
            // console.log(muscles[i]);

        }
        bodyParts[bodyParts.indexOf(bodyPart)].muscles = muscles;
        // console.dir(bodyPart, { depth: null });
        // readlineSync.question("Press any key to continue...");

    }
    // console.dir(await withExercises(bodyParts[2].href), { depth: null });
    // remove the exercisesHTML property from the muscles
    bodyParts.forEach((bodyPart) => {
        bodyPart.muscles?.forEach((muscle) => {
            delete muscle.exercisesHTML;
        })
    });
    fs.writeFileSync("data.json", JSON.stringify(bodyParts, null, 2));
    return;
})();

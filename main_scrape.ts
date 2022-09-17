import { getBodyParts } from "./get/BodyParts";
import { getExercises } from "./get/Exercises";
import { getMuscles, alt_method, withExercises } from "./get/Muscles";

(async () => {
    let bodyParts = await getBodyParts();
    for await (let bodyPart of bodyParts) {
        if (bodyPart.name === "Olympic-style Weightlifts") continue;
        let muscles = await withExercises(bodyPart.href);
        // console.dir(muscles, { depth: null });

        if (bodyPart.name === "Forearms") debugger;
        
        let exercises = await getExercises(muscles[0].exercises);
    }
    // console.dir(await withExercises(bodyParts[2].href), { depth: null });
    return;
})();

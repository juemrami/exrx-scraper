import fs from "node:fs";
import parse from "node-html-parser";

type Exercise = {
    name: string;
    href: string;
    is_variant: boolean;
    variants?: Exercise[];
}
type LI = {
    equipment: string;
    exercises: Exercise[];
}
export const getExercises = async (muscleHTML: string) => {
    let dom = parse(muscleHTML);
    let exercises_li = dom.querySelectorAll(".col-sm-6 > ul > li");

    if (!exercises_li) {
        throw "exercises not found for muscle " + muscleHTML;
    }
    let data = [] as LI[];
    for (let i = 0; i < exercises_li.length; i++) {
        let li = exercises_li[i];
        let equipment = li.firstChild.textContent;
        let exercises = [] as Exercise[];
        data.push({
            equipment,
            exercises,
        })
    }
    console.log(data);
    return data;
}
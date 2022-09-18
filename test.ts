import { exit } from "process";
import { getExerciseData } from "./get/Exercises";

const exerciseData = getExerciseData("https://exrx.net/WeightExercises/BackGeneral/CBStandingTwistingHighRow").then((data) => exit());
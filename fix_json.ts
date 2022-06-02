import { appendFile, appendFileSync, readFile, readFileSync } from "fs";
type datashape = [
  {
    name: string;
    href: string;
    muscles: {
      muscle_name: {
        equipment: {
          equipment_name: string;
          exercise: {
            exercise_name: string;
            href: string;
          };
        };
      };
    };
  }
];
(async () => {
  //Main function
  // read json from output_1.json
  const data = readFileSync("output_1.json", { encoding: "utf-8" });
  const json = JSON.parse(data);

  await appendFileSync("output_fixed.json", JSON.stringify(exercise_data));
})();

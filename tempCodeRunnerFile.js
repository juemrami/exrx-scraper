const grabMuscles = await page.evaluate(() => {
            const siteDivContent = document.querySelectorAll("#mainShell > article > .container > .row > .col-sm-12");
            let Muscles = []
            siteDivContent.forEach( container => {
                if (container.querySelector(".col-sm-6")){
                    const exerciseTypes = container.querySelectorAll(".col-sm-6 > ul > li")
                    const li_children = exerciseTypes.childNodes;
                    console.log(li_children);
                    Muscles.push({li_children});
                    exerciseTypes.forEach( exType =>{
                        const typeName = exType.textContent;
                        const parentName = container.querySelectorAll('h2 [href]').innerText;
                        //Muscles.push({"exerciseType":typeName})

                    })
                } else{
                    //dealing with banner
                    //use [href] to innerText to Long names
                    const muscle = container.querySelectorAll('h2 [href]')
                     muscle.forEach( item =>{
                        Muscles.push({"name": item.innerText});
                    });
                }
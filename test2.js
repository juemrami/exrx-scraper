const puppeteer = require('puppeteer');
(async () => {
    try{
        const browser = await puppeteer.launch({ headless: false, devtools: true, debuggingPort: 5500});
        const page = await browser.newPage();
        
        await page.goto('https://exrx.net/Lists/ExList/ArmWt', {waitUntil: 'domcontentloaded'});

        const grabMuscles = await page.evaluate(() => {
            const siteDivContent = document.querySelectorAll("#mainShell > article > .container > .row > .col-sm-12");
            let Muscles = []
            let excTypes = []
            let excNames = []
            let exVariant = []
            siteDivContent.forEach( container => {
                debugger;
                //4 layers 1-2-3-4, 
                // 1 being the ex type  
                // 2 is ex name 
                // 3 is ex variant 
                // 4 is a variant-variant
                if (container.querySelector(".col-sm-6")){
                    const mole = container.querySelectorAll(".col-sm-6 > ul > li")
                    const layer = 1
                    do {
                        if (!mole.firsChild){
                            
                        }
                        mole = mole.firsChild
                        
                    } while (mole.firsChild);
                    console.log(container);
                    const exerciseTypes = container.querySelectorAll(".col-sm-6 > ul > li")
                    exerciseTypes.forEach(li =>{
                        const li_children = li.childNodes;
                        li_name = li_children[0].textContent;
                        const exNamesContainer = li_children[1]
                        
                        exNamesContainer.forEach(ul =>{

                        });
                    });


                } else{
                    const muscle = container.querySelectorAll('h2 [href]')
                     muscle.forEach( item =>{
                        Muscles.push({"name": item.innerText});
                    })
                }

            });
            return Muscles;
        });
    }catch(e){
        console.log('our err', e);
    }
})();
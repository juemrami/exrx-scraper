(async() => {
    setInterval(() => {
        var toStart = document.querySelectorAll(".zb-button.primary.raised.start-button.start-graphic");
    
        for(var element of toStart){
        element.click();
        }
    
        var speeds = document.querySelectorAll("[aria-label='2x speed']");
    
        for(var element of speeds){
        if(!element.checked){
            element.click();
        }
        }
        var allControls = document.querySelectorAll(".animation-controls");
    
        for(var element of allControls){
        var readyElements = element.querySelectorAll(".zb-button.primary.step:not(.disabled)");
    
        if(readyElements.length > 0){
            var lastReady = readyElements[readyElements.length-1];
            if(!lastReady.classList.contains("step-highlight")){
            lastReady.click();
            }
        }
        }
    }, 2000);
    var multipleChoice = document.querySelectorAll('div.interactive-activity-container.multiple-choice-content-resource.participation.large.ember-view')
    //console.log (multipleChoice)
    for(var element of multipleChoice){
        if (element.querySelector("[aria-label='Activity completed']")){
            continue;
        }
        var questions = element.querySelectorAll(".question-set-question.multiple-choice-question.ember-view")
        for( var q of questions ){
            if(q.querySelector["[aria-label='Question completed']"] == null){
                var choices = q.querySelectorAll(".zb-radio-button.orange.orange.ember-view input")
                for (let i = 0; i <choices.length; i++){
                    choices[i].click();
                    console.log(q.querySelector('.zb-explanation.has-explanation.correct'))
                    if (q.querySelector('.zb-explanation.has-explanation.correct')){
                        break;
                    }
                }
            }
        }

    }
})();
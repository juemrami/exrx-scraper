()=> {
    'use strict';
    let fs = require('fs');
    let request = require('request');
    let cheerio = require('cheerio');

    const scrapeUrl = 'http://www.exrx.net/Lists/Directory.html/';

    let getExerciseData = (url, subarea) => {
        const exerciseUrl = `http://www.exrx.net/Lists/${url}`;
        request(exerciseUrl, (error, response, html) => {
            if (!error) {
                let $ = cheerio.load(html);
                let exerciseData = {
                    exerciseData: $('table[border="1"] > tr > td > ul > li').map(function(i, elem) {
                        if(1=== subarea) {

                        }

                        return {
                            category: $(this).first().text().split('\r\n')[0],
                            exercises: $(this).find('ul > li').map(function(i, elem) {
                                    return {name: $(this).text(), url: $(this).attr('href')}
                            }).get()
                        }
                    }).get()
                }
                console.dir(exerciseData.exerciseData);
            }
            else {
                console.warn(`Error message in getExerciseData: ${error}`);
                return null;
            }
        })
    }

    let getMuscleData = (callback) => {
        request(scrapeUrl, (error, response, html) => {
            if (!error) {
                let $ = cheerio.load(html);

                let muscleData = {
                    muscleData: $('table[border="1"] > tr > td:nth-child(1) > ul > li').map(function(i, elem) {
                        return {
                            area: {name: $(this).find('a').first().text(), url: $(this).find('a').first().attr('href'),
                            subareas:
                                $(this).find('a').map(function(i, elem) {
                                    if(i!==0){
                                        return {name: $(this).text(), url: $(this).attr('href'), 'exercises': ''};
                                    }
                            }).get()},
                        }
                    }).get()
                }
                return callback(muscleData);
            }
            else {
                console.warn(`Error message in getMuscleData: ${error}`);
                return null;
            }
        });
    };
    let writeToJsonFile = (dataToWrite) => {
        fs.writeFile('data.json', JSON.stringify(dataToWrite), (err) => {
            if (err) throw err;
            console.log('Saved.');
        });
    };
    getMuscleData(function(data) {
        writeToJsonFile(data);
    });
    // getExerciseData('ExList/NeckWt.html#Sternocleidomastoid', 'Sternocleidomastoid');
}()

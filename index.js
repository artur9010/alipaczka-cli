#!/usr/bin/env node
const request = require("request");
const colors = require("colors");
const cheerio = require("cheerio");
const cliTable = require("cli-table");
const utf8 = require('utf8');

if(process.argv.length == 2){
    console.log("Correct usage: ".red + "alipaczka-cli [tracking number]".grey);
    process.exit();
}

var trackingNumber = process.argv[2];

request("https://alipaczka.pl/pobierz.php?q=" + trackingNumber, function(error, response, body){
    if(error){
        console.log("There was an error :<".red);
        console.log(error);
        process.exit();
    }

    if(body.includes("Nie udało się wykonać śledzenia dla tej przesyłki.")){
        console.log("Something went wrong with Alipaczka...".red);
        process.exit();
    }

    if(body.includes("Niestety aktualnie nie obsługujemy śledzenia paczek tego przewoźnika")){
        console.log("Alipaczka dosen't support that carrier...".red);
        process.exit();
    }

    // Shitty parsing... but it works.
    var $ = cheerio.load(utf8.decode(body));
    $(".panel").each(function(){
        // There is 3 div's. First two are a tracking information, third is just a link. The first two has the same "style" attribute.
        if($(this).attr("style").includes("width:70%; left:15%;")){
            $ = cheerio.load($(this).html());
            var headers = [];
            var otherThings = [];
            $("th").each(function(){
                headers[headers.length] = $(this).html();
            })
            $("td").each(function(){
                otherThings[otherThings.length] = $(this).html();
            })

            var title = $(".title").html();
            console.log(title.blue)
            var table = new cliTable({
                head: headers
              , colWidths: [30, 30, 90]
            });

            for(i = 0; i < otherThings.length/headers.length; i++){
                table.push(
                    [otherThings[0+i*3], otherThings[1+i*3], otherThings[2+i*3]]
                );
            }

            console.log(table.toString());
        }
    })
});
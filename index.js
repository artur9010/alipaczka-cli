/*
MIT License

Copyright (c) 2018 Artur Motyka

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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
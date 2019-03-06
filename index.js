#!/usr/bin/env node
const request = require("request");
const cliTable = require("cli-table");
const moment = require("moment");

if(process.argv.length === 2){
    console.log("Correct usage: alipaczka [tracking number]");
    process.exit();
}

const trackingNumber = process.argv[2];

request("https://alipaczka.pl/mobileAPI2.php?number=" + trackingNumber, function (error, response, body) {
    if(error){
        console.log("Something went wrong: " + error);
        process.exit();
    }

    const json = JSON.parse(body);

    if(json.error){
        console.log("Error from Alipaczka service: " + json.error);
        process.exit();
    }


    console.log("Tracking number: " + trackingNumber);
    //console.log("Delivered: " + "no"); //todo
    console.log("Package status:");

    var table = new cliTable({
        head: ["Date", "Status"],
        colWidths: [30, (process.stdout.columns-33)]
    });

    for(x = json.DataEntry.length - 1; x > 0; x--){ //from last to first
        table.push(
            [
                moment(new Date(json.DataEntry[x]["time"] * 1000)).format("MMMM Do YYYY, H:mm:ss"),
                json.DataEntry[x]["status"]
            ]
        );
    }

    console.log(table.toString());
});
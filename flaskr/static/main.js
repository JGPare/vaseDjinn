

var settings;
var tablesMade = false;

// index table
var indexList;
var startRow = 0;
var displayNum = 11;

window.onload = init;

function init(){
    loadSettings();
    loadDefault();
}

import {removeMesh,addMesh,getApperance,setApperance} from './visualizer.js';

function createRange(name,value=50,min=0,max=100,step=1) {
        var range = document.createElement("INPUT");
        range.setAttribute("class","form-range my-range");
        range.setAttribute("type","range");
        range.setAttribute("value",value);
        range.setAttribute("name",name);
        range.setAttribute("min",min);
        range.setAttribute("max",max);
        range.setAttribute("step",step);

        return range;
    }

function readAllTables(){
    var vaseObj = {};
    vaseObj["name"] = $("#inputName").val();
    vaseObj["access"] = $("#inputAccess").val();
    vaseObj["generic0"] = readTable("generic0-table")[0];
    vaseObj["generic1"] = readTable("generic1-table")[0];
    vaseObj["radial"] = readTable("radial-table");
    vaseObj["vertical"] = readTable("vertical-table");

    return vaseObj;
}

function setAllTables(vaseData){
    
    setTable("generic0-table",[vaseData["generic0"]]);
    setTable("generic1-table",[vaseData["generic1"]]);
    setTable("radial-table",vaseData["radial"]);
    setTable("vertical-table",vaseData["vertical"]);
    console.log("set name",vaseData["name"]);
    $("#inputName").val(vaseData["name"]);

}

function readTable(parentID){
    // Loop through grabbing everything
    var myRows = [];
    const dataType = $("#" + parentID).attr("data");
    var $headers = $("#" + parentID + " > thead td");
    var $rows = $("#" + parentID + " > tbody tr ").each(function(index) {
        var $cells = $(this).find("td");
        myRows[index] = {};
        $cells.each(function(cellIndex) {
            var value = ($(this).find("input").val());
            var key = $($headers[cellIndex]).attr("data");
            myRows[index][key] = value;
          });    
    });
    // console.log(JSON.stringify(myRows));
    return dataType,myRows;
}


function setTable(parentID,data){
    // Loop through grabbing everything
    var myRows = [];
    const dataType = $("#" + parentID).attr("data");
    var $headers = $("#" + parentID + " > thead td");
    var $rows = $("#" + parentID + " > tbody tr ").each(function(index) {
        var $cells = $(this).find("td");
        $cells.each(function(cellIndex) {
            var key = $($headers[cellIndex]).attr("data");
            ($(this).find("input").val(data[index][key]));
          });    
    });
}

function createTables(data) {

    var generic0 = data.generic0;
    var generic1 = data.generic1;
    var verticals = data.vertical; 
    var radials = data.radial;

// height width thickness table
    var generic0Headers = ["height","width","thickness"];
    var generic0HeadersData = ["height","width","thickness"];

    var table = document.createElement("TABLE");  //makes a table element for the page
    table.setAttribute("class","table table-dark table-hover my-dark-table text-center");
    table.setAttribute("id","generic0-table");
    table.setAttribute("data","generic");
    
    var row = table.insertRow(0);
    row.insertCell(0).appendChild(createRange(
        "height",
        generic0.height,
        settings.height.min,
        settings.height.max,
        settings.height.step,));
    row.insertCell(1).appendChild(createRange(
        "width",
        generic0.width,
        settings.width.min,
        settings.width.max,
        settings.width.step,));
    row.insertCell(2).appendChild(createRange(
        "thickness",
        generic0.thickness,
        settings.thickness.min,
        settings.thickness.max,
        settings.thickness.step,
        ));
    
    var header = table.createTHead();
    var headerRow = header.insertRow(0);
    for(var i = 0; i < generic0Headers.length; i++) {
        var headElem = document.createElement("td");
        headElem.innerHTML = generic0Headers[i]
        headElem.setAttribute("data",generic0HeadersData[i]);
        headerRow.appendChild(headElem);
    };

    var generic0Container = document.getElementById("generic0-container");
    generic0Container.appendChild(table);

// steps and slope table
    var generic1Headers = ["vertical steps","radial steps","slope"];
    var generic1HeadersData = ["vertical_steps","radial_steps","slope"];

    var table = document.createElement("TABLE");  //makes a table element for the page
    table.setAttribute("class","table table-dark table-hover my-dark-table text-center");
    table.setAttribute("id","generic1-table");
    table.setAttribute("data","generic");

    var row = table.insertRow(0);
    row.insertCell(0).appendChild(createRange(
        "verticalSteps",
        generic1.vertical_steps,
        settings.vertical_steps.min,
        settings.vertical_steps.max,
        settings.vertical_steps.step,
        ));
    row.insertCell(1).appendChild(createRange(
        "radialSteps",
        generic1.radial_steps,
        settings.radial_steps.min,
        settings.radial_steps.max,
        settings.radial_steps.step,
        ));
    row.insertCell(2).appendChild(createRange(
        "slope",
        generic1.slope,
        settings.slope.min,
        settings.slope.max,
        settings.slope.step,));
    
    var header = table.createTHead();
    var headerRow = header.insertRow(0);
    for(var i = 0; i < generic1Headers.length; i++) {
        var headElem = document.createElement("td");
        headElem.innerHTML = generic1Headers[i]
        headElem.setAttribute("data",generic1HeadersData[i]);
        headerRow.appendChild(headElem);
    };

    // var generic1Container = document.getElementById("generic1Container");
    var generic1Container = $("#generic1-container")[0];
    generic1Container.appendChild(table);

// radial table
    var radialHeaders = ["modifier", "amount", "frequency", "twist", "phase"];
    var radialHeadersData = ["modifier", "mag", "freq", "twist", "phase"];

    var table = document.createElement("TABLE");
    table.setAttribute("class","table table-dark table-hover my-dark-table text-center");
    table.setAttribute("id","radial-table")
    table.setAttribute("data","radial");

    for(var i = 0; i < radials.length; i++) {
        var row = table.insertRow(i);
        var row_label = document.createElement("p");
        row_label.innerHTML = "radial " + (i+1);
        row_label.setAttribute("class","input_small");
        row.insertCell(0).appendChild(row_label); 
        row.insertCell(1).appendChild(createRange(
            "r" + i + "_mag",
            radials[i].mag,
            settings.radial_mag.min,
            settings.radial_mag.max,
            settings.radial_mag.step,
        ));
        row.insertCell(2).appendChild(createRange(
            "r" + i + "_freq",
            radials[i].freq,
            settings.radial_freq.min,
            settings.radial_freq.max,
            settings.radial_freq.step,
            ));
        row.insertCell(3).appendChild(createRange(
            "r" + i + "_twist",
            radials[i].twist,
            settings.radial_twist.min,
            settings.radial_twist.max,
            settings.radial_twist.step,
            ));
        row.insertCell(4).appendChild(createRange(
            "r" + i + "_phase",
            radials[i].phase,
            settings.radial_phase.min,
            settings.radial_phase.max,
            settings.radial_phase.step,
            ));
    };
    var header = table.createTHead();
    var headerRow = header.insertRow(0);
    for(var i = 0; i < radialHeaders.length; i++) {
        var headElem = document.createElement("td");
        headElem.innerHTML = radialHeaders[i]
        headElem.setAttribute("data",radialHeadersData[i]);
        headerRow.appendChild(headElem);
    };

    var radialContainer = document.getElementById("radial-container");
    radialContainer.appendChild(table);

 // vertical table
    var verticalHeaders = ["modifier", "amount", "frequency", "phase"];
    var verticalHeadersData = ["modifier", "mag", "freq", "phase"];
    var table = document.createElement("TABLE");  //makes a table element for the page
    table.setAttribute("class","table table-dark table-hover my-dark-table text-center");
    table.setAttribute("id","vertical-table")
    table.setAttribute("data","vertical");
    
    for(var i = 0; i < verticals.length; i++) {
        var row = table.insertRow(i);
        var row_label = document.createElement("p");
        row_label.innerHTML = "vertical " + (i+1);
        row_label.setAttribute("class","input_small");
        row.insertCell(0).appendChild(row_label); 

        row.insertCell(1).appendChild(createRange(
            "v" + i + "_mag",
            verticals[i].mag,
            settings.vertical_mag.min,
            settings.vertical_mag.max,
            settings.vertical_mag.step,
            ));
        row.insertCell(2).appendChild(createRange(
            "v" + i + "_freq",
            verticals[i].freq,
            settings.vertical_freq.min,
            settings.vertical_freq.max,
            settings.vertical_freq.step,
            ));
        row.insertCell(3).appendChild(createRange(
            "v" + i + "_phase",
            verticals[i].phase,
            settings.vertical_phase.min,
            settings.vertical_phase.max,
            settings.vertical_phase.step,
            ));
    };
    var header = table.createTHead();
    var headerRow = header.insertRow(0);
    for(var i = 0; i < verticalHeaders.length; i++) {
        var headElem = document.createElement("td");
        headElem.innerHTML = verticalHeaders[i]
        headElem.setAttribute("data",verticalHeadersData[i]);
        headerRow.appendChild(headElem);
    };

    var verticalContainer = document.getElementById("vertical-container");
    verticalContainer.appendChild(table);
};

function createIndexList(indexList,offsetDir=0){
    startRow += offsetDir*(displayNum-1);
    var endRow = startRow + displayNum;
    if (endRow > indexList.length ){
        endRow = indexList.length;
    } else if (startRow < 0){
        startRow = 0;
    }

    var table = document.createElement("TABLE");
    table.setAttribute("class","table table-dark table-hover my-dark-table");
    table.setAttribute("id","index-table");
    table.setAttribute("data","index");

    var i = 0;
    if (startRow > 0){
        // console.log(startRow+displayNum,indexList.length);
        var row = table.insertRow(0);
        row.setAttribute("style","width: 2rem; height: 2rem;");
        row.setAttribute("id","up-arrow-row");

        var button = $("<a></a>");
        button.attr("data","up-button");
        button.attr("class","btn text-light h-100 w-100 py-0");
        button.attr("id","up-arrow-button");

        var img = document.createElement("img");
        img.src = upArrow;
        img.setAttribute("style","width: 2rem; height: 2rem;");

        button[0].appendChild(img);
        row.insertCell(0).appendChild(button[0]); 
        i++;
    }
    
    for(; i + startRow < endRow && i < displayNum; i++) {
       
        var row = table.insertRow(i);
        var button = $("<a></a>");
        var name = $("<p></p>");
        var user = $("<p></p>");

        name.attr("class","text-start mb-0");
        user.attr("class","text-end mb-0 text-secondary");

        name.text(indexList[i+startRow].name);
        user.text("creator: "+indexList[i+startRow].user);

        button.attr("data",JSON.stringify(indexList[i+startRow]));
        name.attr("data",JSON.stringify(indexList[i+startRow]));
        user.attr("data",JSON.stringify(indexList[i+startRow]));

        button.attr("class","btn vaseLoader d-flex justify-content-between text-light h-100 w-100");
        button.attr("id","vaseLoader");
        button.append(name);
        button.append(user);
        row.insertCell(0).appendChild(button[0]); 
    };

    if (endRow != indexList.length){
        var row = table.insertRow(i);
        row.setAttribute("style","width: 2rem; height: 2rem;");

        var button = $("<a></a>");
        button.attr("data","down-button");
        button.attr("class","btn text-light h-100 w-100 py-0");
        button.attr("id","down-arrow-button");

        var img = document.createElement("img");
        img.src = downArrow;
        img.setAttribute("style","width: 2rem; height: 2rem;");

        button[0].appendChild(img);
        row.insertCell(0).appendChild(button[0]); 
    };

    $("#index-container")[0].appendChild(table);
}

// button actions 
$(document).on("click",'#vaseLoader' ,function(event) {
    console.log("load from index attempt",);
    event.stopPropagation();
    event.stopImmediatePropagation();
    var data = event.target.getAttribute("data");
    load(data);
});

$( "#load-vase" ).on( "click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    $("#index-table").remove();
    getIndex();
    $("#myForm").toggle();
    $("#index-outer-container").toggle();
});

$(document).on("change","#input-load-access",function(event) {
    console.log("select change");
    event.stopPropagation();
    $("#index-table").remove();
    getIndex();
});

$( "#edit-vase" ).on( "click", function(event) {
    event.preventDefault();
    event.stopPropagation();
    $("#index-outer-container").toggle();
    $("#myForm").toggle();
});

$( "#delete-vase" ).on( "click", function(event) {
    deleteVase($("#inputName").val());
    $("#inputName").val("GregTheVase");
    event.preventDefault();
    event.stopPropagation();
});

$(document).on("click",'#down-arrow-button' ,function(event) {
    event.stopPropagation();
    $("#index-table").remove();
    createIndexList(indexList,1);

});

$(document).on("click",'#up-arrow-button' ,function(event) {
    event.stopPropagation();
    $("#index-table").remove();
    createIndexList(indexList,-1);
});

window.onbeforeunload = closingCode;
function closingCode(){
   deleteFile(stl_path);
   return null;
}

// AJAX FUNCTIONS //

// save function
$('#myForm').submit(function(event) {
    event.preventDefault(); // Prevent the form from submitting via the browser
    console.log('save attempt attempt');
    var form = $(this);
    var data = readAllTables();
    data["appearance"] = getApperance();
    $.ajax({
      type: form.attr('method'),
      url: form.attr('action'),
      contentType: "application/json; charset=utf-8",
      traditional: true,
      data: JSON.stringify(data),
    }).done(function(data) {
      const old_path = stl_path;
      stl_path = JSON.parse(data);
      console.log('vase saved');
      removeMesh();
      addMesh();
      deleteFile(old_path);
    }).fail(function(data) {
      // Optionally alert the user of an error here...
    });
});


// contentType: "application/json; charset=utf-8",
// traditional: true,
// load settings function
function loadSettings() {
    console.log('setting load attempt')
    $.ajax({
      type: "POST",
      url: "loadSettings",
      data: "",
    }).done(function(data) {
      console.log('loaded settings');
      settings = JSON.parse(data);
      // console.log(settings);
    }).fail(function(data) {
      console.log('failed to load settings');
    });
};

// load function
function loadDefault(name="") {
    console.log('load default attempt');
    $.ajax({
        type: "POST",
        url: "loadVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(""),
    }).done(function(data) {
        console.log('loaded default vase');
        var [vaseData,appearance,path] = JSON.parse(data)
        stl_path = path;
        vaseData = vaseData;
        createTables(vaseData);
    }).fail(function(data) {
      console.log('failed to load default');
    });
};

function getIndex(){
    console.log('load index attempt');
    var access = $("#input-load-access").val();
    $.ajax({
        type: "POST",
        url: "getIndex",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(access),
    }).done(function(data) {
        console.log('indexes got');
        indexList = JSON.parse(data);
        createIndexList(indexList);
    }).fail(function(data) {
      console.log('failed to get indexes');
    });
}

// load function
function load(inputData="") {
    console.log('load attempt');
    $.ajax({
        type: "POST",
        url: "loadVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: inputData,
    }).done(function(data) {
        console.log('loaded vase');
        var [vaseData,appearance,path] = JSON.parse(data);
        console.log("pre-parse load path",path);
        const old_path = stl_path;
        stl_path = path;
        vaseData = JSON.parse(vaseData);
        appearance = JSON.parse(appearance);
        setApperance(appearance);
        vaseData["name"] = JSON.parse(inputData).name;
        setAllTables(vaseData);
        removeMesh();
        addMesh();
        deleteFile(old_path);
    }).fail(function(data) {
      console.log('failed to load vase');
    });
}

// delete function
function deleteVase(name="") {
    console.log('delete vase attempt');
    $.ajax({
        type: "POST",
        url: "deleteVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(name),
    }).done(function(data) {
        console.log('deleted vase');
        var vaseData = JSON.parse(data);
        $("#index-table").remove();
        getIndex();
        vaseData["name"] = name;
        setAllTables(vaseData);
        removeMesh();
        stl_path = default_path;
        addMesh();
    }).fail(function(data) {
      // Optionally alert the user of an error here...
    });
};

// delete function
function deleteFile(path="") {
    console.log('delete file attempt');
    $.ajax({
        type: "POST",
        url: "deleteFile",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(path),
    }).done(function(data) {
        console.log('deleted file');
    }).fail(function(data) {
      // Optionally alert the user of an error here...
    });
};




let settings
const debug = false
let username = ""

// index table
let indexList
let startRow = 0
let displayNum = 10

window.onload = init

function init() {
    loadSettings()
}

import { setVase, transitionVase, getApperance, setApperance, transistionApperance } from './visualizer.js'

function createRange(name, value = 50, min = 0, max = 100, step = 1) {
    
    let inputGroup = $("<div></div>")[0]
    inputGroup.setAttribute("class","input-group")

    let range = $("<input>")[0]
    range.setAttribute("class", "form-range my-range form-control pe-1")
    range.setAttribute("type", "range")
    range.setAttribute("name", name)
    range.setAttribute("value", value)
    range.setAttribute("min", min)
    range.setAttribute("max", max)
    range.setAttribute("step", step)

    let appendDiv = $("<div></div>")[0]
    appendDiv.setAttribute("class","input-group-append")
    
    let number = $("<span></span>").html(value.toString())[0]
    number.setAttribute("class","input-group-text number-text")

    appendDiv.appendChild(number)

    inputGroup.appendChild(range)
    inputGroup.appendChild(appendDiv)

    return inputGroup
}

function readAllTables() {
    let vaseObj = {}
    vaseObj["name"] = $("#input-name").val()
    vaseObj["access"] = $("#input-load-access").val()
    vaseObj["generic0"] = readTable("generic0-table")[0]
    vaseObj["generic1"] = readTable("generic1-table")[0]
    vaseObj["radial"] = readTable("radial-table")
    vaseObj["vertical"] = readTable("vertical-table")

    return vaseObj
}

function setAllTables(vaseData) {

    setTable("generic0-table", [vaseData["generic0"]])
    setTable("generic1-table", [vaseData["generic1"]])
    setTable("radial-table", vaseData["radial"])
    setTable("vertical-table", vaseData["vertical"])
    if (debug) {
        console.log("set name", vaseData["name"])
    }
    $("#input-name").val(vaseData["name"])

}

function readTable(parentID) {
    let myRows = []
    let dataType = $("#" + parentID).attr("data")
    let $headers = $("#" + parentID + " > thead td")
    let $rows = $("#" + parentID + " > tbody tr ").each(function (index) {
        let $cells = $(this).find("td")
        myRows[index] = {}
        $cells.each(function (cellIndex) {
            const value = ($(this).find("input").val())
            const key = $($headers[cellIndex]).attr("data")
            myRows[index][key] = value
        })
    })
    return dataType, myRows
}


function setTable(parentID, data) {
    let myRows = []
    const dataType = $("#" + parentID).attr("data")
    let $headers = $("#" + parentID + " > thead td")
    let $rows = $("#" + parentID + " > tbody tr ").each(function (index) {
        let $cells = $(this).find("td")
        $cells.each(function (cellIndex) {
            const key = $($headers[cellIndex]).attr("data")
            let range = $(this).find("input")
            range.val(data[index][key])
            setNumberText(range)
        })
    })
}

function createTables(data) {

    let generic0 = data.generic0
    let generic1 = data.generic1
    let verticals = data.vertical
    let radials = data.radial

    let table
    let row
    let header
    let headerRow

    const generic0Headers = ["height", "width", "thickness"]
    const generic0HeadersData = ["height", "width", "thickness"]

    table = $("<table>")[0]
    table.setAttribute("class", "table table-dark table-hover my-dark-table text-center")
    table.setAttribute("id", "generic0-table")
    table.setAttribute("data", "generic")

    row = table.insertRow(0)
    row.insertCell(0).appendChild(createRange(
        "height",
        generic0.height,
        settings.height.min,
        settings.height.max,
        settings.height.step,))
    row.insertCell(1).appendChild(createRange(
        "width",
        generic0.width,
        settings.width.min,
        settings.width.max,
        settings.width.step,))
    row.insertCell(2).appendChild(createRange(
        "thickness",
        generic0.thickness,
        settings.thickness.min,
        settings.thickness.max,
        settings.thickness.step,
    ))

    header = table.createTHead()
    headerRow = header.insertRow(0)
    for (let i = 0; i < generic0Headers.length; i++) {
        let headElem = document.createElement("td")
        headElem.innerHTML = generic0Headers[i]
        headElem.setAttribute("data", generic0HeadersData[i])
        headerRow.appendChild(headElem)
    }

    let generic0Container = document.getElementById("generic0-container")
    generic0Container.appendChild(table)

    const generic1Headers = ["vertical steps", "radial steps", "slope"]
    const generic1HeadersData = ["vertical_steps", "radial_steps", "slope"]

    table = document.createElement("TABLE")
    table.setAttribute("class", "table table-dark table-hover my-dark-table text-center")
    table.setAttribute("id", "generic1-table")
    table.setAttribute("data", "generic")

    row = table.insertRow(0)
    row.insertCell(0).appendChild(createRange(
        "verticalSteps",
        generic1.vertical_steps,
        settings.vertical_steps.min,
        settings.vertical_steps.max,
        settings.vertical_steps.step,
    ))
    row.insertCell(1).appendChild(createRange(
        "radialSteps",
        generic1.radial_steps,
        settings.radial_steps.min,
        settings.radial_steps.max,
        settings.radial_steps.step,
    ))
    row.insertCell(2).appendChild(createRange(
        "slope",
        generic1.slope,
        settings.slope.min,
        settings.slope.max,
        settings.slope.step,))

    header = table.createTHead()
    headerRow = header.insertRow(0)
    for (let i = 0; i < generic1Headers.length; i++) {
        let headElem = document.createElement("td")
        headElem.innerHTML = generic1Headers[i]
        headElem.setAttribute("data", generic1HeadersData[i])
        headerRow.appendChild(headElem)
    };

    let generic1Container = $("#generic1-container")[0]
    generic1Container.appendChild(table)

    // radial table
    const radialHeaders = ["modifier", "amount", "frequency", "twist", "phase"]
    const radialHeadersData = ["modifier", "mag", "freq", "twist", "phase"]

    table = $("<table>")[0]
    table.setAttribute("class", "table table-dark table-hover my-dark-table text-center")
    table.setAttribute("id", "radial-table")
    table.setAttribute("data", "radial")

    for (let i = 0; i < radials.length; i++) {
        let row = table.insertRow(i)
        row.insertCell(0).innerHTML = "radial " + (i + 1)

        row.insertCell(1).appendChild(createRange(
            "r" + i + "_mag",
            radials[i].mag,
            settings.radial_mag.min,
            settings.radial_mag.max,
            settings.radial_mag.step,
        ))
        row.insertCell(2).appendChild(createRange(
            "r" + i + "_freq",
            radials[i].freq,
            settings.radial_freq.min,
            settings.radial_freq.max,
            settings.radial_freq.step,
        ))
        row.insertCell(3).appendChild(createRange(
            "r" + i + "_twist",
            radials[i].twist,
            settings.radial_twist.min,
            settings.radial_twist.max,
            settings.radial_twist.step,
        ))
        row.insertCell(4).appendChild(createRange(
            "r" + i + "_phase",
            radials[i].phase,
            settings.radial_phase.min,
            settings.radial_phase.max,
            settings.radial_phase.step,
        ))
    };
    header = table.createTHead()
    headerRow = header.insertRow(0)
    for (let i = 0; i < radialHeaders.length; i++) {
        let headElem = document.createElement("td")
        headElem.innerHTML = radialHeaders[i]
        headElem.setAttribute("data", radialHeadersData[i])
        headerRow.appendChild(headElem)
    };

    let radialContainer = document.getElementById("radial-container")
    radialContainer.appendChild(table)

    // vertical table
    const verticalHeaders = ["modifier", "amount", "frequency", "phase"]
    const verticalHeadersData = ["modifier", "mag", "freq", "phase"]
    table = $("<table>")[0]
    table.setAttribute("class", "table table-dark table-hover my-dark-table text-center")
    table.setAttribute("id", "vertical-table")
    table.setAttribute("data", "vertical")

    for (let i = 0; i < verticals.length; i++) {
        let row = table.insertRow(i)
        row.insertCell(0).innerHTML = "vertical " + (i + 1)

        row.insertCell(1).appendChild(createRange(
            "v" + i + "_mag",
            verticals[i].mag,
            settings.vertical_mag.min,
            settings.vertical_mag.max,
            settings.vertical_mag.step,
        ))
        row.insertCell(2).appendChild(createRange(
            "v" + i + "_freq",
            verticals[i].freq,
            settings.vertical_freq.min,
            settings.vertical_freq.max,
            settings.vertical_freq.step,
        ))
        row.insertCell(3).appendChild(createRange(
            "v" + i + "_phase",
            verticals[i].phase,
            settings.vertical_phase.min,
            settings.vertical_phase.max,
            settings.vertical_phase.step,
        ))
    };
    header = table.createTHead()
    headerRow = header.insertRow(0)
    for (let i = 0; i < verticalHeaders.length; i++) {
        let headElem = document.createElement("td")
        headElem.innerHTML = verticalHeaders[i]
        headElem.setAttribute("data", verticalHeadersData[i])
        headerRow.appendChild(headElem)
    };

    let verticalContainer = document.getElementById("vertical-container")
    verticalContainer.appendChild(table)
};

function createIndexList(indexList, offsetDir = 0) {

    startRow += offsetDir * (displayNum - 1)
    let endRow = startRow + displayNum
    if (endRow > indexList.length) {
        endRow = indexList.length
    } else if (startRow < 0) {
        startRow = 0
    }

    const indexHeaders = ["Vase Name", "Creator", "Downloads"]

    let table = $("<table>")[0]
    table.setAttribute("class", "table table-dark table-hover my-dark-table text-center")
    table.setAttribute("id", "index-table")
    table.setAttribute("data", "index")

    let i = 0
    if (startRow > 0) {
        let row = table.insertRow(0)
        row.setAttribute("style", "width: 2rem; height: 2rem;")
        row.setAttribute("id", "up-arrow-row")

        let button = $("<a></a>")
        button.attr("data", "up-button")
        button.attr("class", "btn text-light h-100 w-100 py-0")
        button.attr("id", "up-arrow-button")

        let img = document.createElement("img")
        img.src = upArrow
        img.setAttribute("style", "width: 2rem; height: 2rem;")

        button[0].appendChild(img)
        row.insertCell(0)
        row.insertCell(1).appendChild(button[0])
        row.insertCell(2)
        i++
    }

    for (; i + startRow < endRow && i < displayNum; i++) {

        let row = table.insertRow(i)
        let buttonName = $("<a></a>")
        let buttonUser = $("<a></a>")
        let buttonDownloads = $("<a></a>")
        let name = $("<p></p>")
        let user = $("<p></p>")
        let downloads = $("<p></p>")

        name.attr("class", "text-start mb-0")
        user.attr("class", "text-end mb-0 text-secondary")
        downloads.attr("class", "text-end mb-0 text-secondary")

        name.text(indexList[i + startRow].name)
        user.text(indexList[i + startRow].user)
        downloads.text(indexList[i + startRow].downloads)

        buttonName.attr("data", JSON.stringify(indexList[i + startRow]))
        buttonUser.attr("data", JSON.stringify(indexList[i + startRow]))
        buttonDownloads.attr("data", JSON.stringify(indexList[i + startRow]))

        name.attr("data", JSON.stringify(indexList[i + startRow]))
        user.attr("data", JSON.stringify(indexList[i + startRow]))

        buttonName.attr("class", "btn vaseLoader d-flex justify-content-center text-light h-100 w-100")
        buttonName.attr("id", "vaseLoader")
        buttonUser.attr("class", "btn vaseLoader d-flex justify-content-center text-light h-100 w-100")
        buttonUser.attr("id", "vaseLoader")
        buttonDownloads.attr("class", "btn vaseLoader d-flex justify-content-center text-light h-100 w-100")
        buttonDownloads.attr("id", "vaseLoader")

        buttonName.append(name)
        buttonUser.append(user)
        buttonDownloads.append(downloads)

        row.insertCell(0).appendChild(buttonName[0])
        row.insertCell(1).appendChild(buttonUser[0])
        row.insertCell(2).appendChild(buttonDownloads[0])

    };

    if (endRow != indexList.length) {
        let row = table.insertRow(i)
        row.setAttribute("style", "width: 2rem; height: 2rem;")

        let button = $("<a></a>")
        button.attr("data", "down-button")
        button.attr("class", "btn text-light h-100 w-100 py-0")
        button.attr("id", "down-arrow-button")

        let img = document.createElement("img")
        img.src = downArrow
        img.setAttribute("style", "width: 2rem; height: 2rem;")

        button[0].appendChild(img)

        row.insertCell(0)
        row.insertCell(1).appendChild(button[0])
        row.insertCell(2)
    };

    let header = table.createTHead()
    let headerRow = header.insertRow(0)

    for (let i = 0; i < indexHeaders.length; i++) {
        let headElem = document.createElement("td")
        headElem.innerHTML = indexHeaders[i]
        headElem.setAttribute("style", "padding: 0.5rem")
        headerRow.appendChild(headElem)
    };

    $("#index-container")[0].appendChild(table)
}

// button actions 
$(document).on("click", '#vaseLoader', function (event) {
    event.stopPropagation()
    event.stopImmediatePropagation()
    let data = event.target.getAttribute("data")
    load(data)
})

$("#load-vase").on("click", function (event) {
    event.preventDefault()
    event.stopPropagation()
    $("#index-table").remove()
    getIndex()
    $("#myForm").toggle()
    $("#index-outer-container").toggle()
})

$("#load-random").on("click", function (event) {
    event.preventDefault()
    event.stopPropagation()
    loadRandom()
})

$(document).on("change", "#index-load-access", function (event) {
    event.stopPropagation()
    $("#index-table").remove()
    getIndex()
})

$("#edit-vase").on("click", function (event) {
    event.preventDefault()
    event.stopPropagation()
    $("#index-outer-container").toggle()
    $("#myForm").toggle()
})

$("#delete-vase").on("click", function (event) {
    event.preventDefault()
    event.stopPropagation()
    deleteVase($("#input-name").val())
    $("#input-name").val("GregTheVase")
})

$(document).on("click", '#down-arrow-button', function (event) {
    event.stopPropagation()
    $("#index-table").remove()
    createIndexList(indexList, 1)

})

$(document).on("click", '#up-arrow-button', function (event) {
    event.stopPropagation()
    $("#index-table").remove()
    createIndexList(indexList, -1)
})

$(document).on("input", ".form-range", function (event) {
    if (debug) {
        console.log("slider change")
    }
    let range = $(event.target)
    setNumberText(range)
    update()
    event.stopPropagation()
})

function update() {
    const data = readAllTables()
    setVase(data)
}

function transition(){
    const data = readAllTables()
    transitionVase(data)
}

function setNumberText(range) {
    const rangeName = range.attr("name")
    range.next("div").children("span").html(range.val())
}
// AJAX FUNCTIONS //

// save function
$('#myForm').submit(function (event) {
    event.preventDefault() // Prevent the form from submitting via the browser
    let form = $(this)
    let data = readAllTables()
    if (debug) {
        console.log('save attempt attempt')
        console.log("Vase Data:")
        console.log(data)
    }
    data["appearance"] = getApperance()
    $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(data),
    }).done(function (data) {
        if (debug) {
            console.log('vase saved')
        }
        $('input[name="height"]').focus()
        username = ""
    }).fail(function (data) {
        if (debug){
            console.log("Save attempt failed.");
        }
    })
})

function loadSettings() {
    if (debug) {
        console.log('setting load attempt')
    }
    $.ajax({
        type: "POST",
        url: "loadSettings",
        data: "",
    }).done(function (data) {
        if (debug) {
            console.log('loaded settings')
        }
        settings = JSON.parse(data)
        loadDefault()
    }).fail(function (data) {
        if (debug) {
            console.log('failed to load settings')
        }
    })
};

function loadDefault(name = "") {
    if (debug) {
        console.log('load default attempt')
    }
    $.ajax({
        type: "POST",
        url: "loadVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(""),
    }).done(function (data) {
        if (debug) {
            console.log('loaded default vase')
        }
        let [vaseData, appearance, downloads] = JSON.parse(data)
        vaseData = JSON.parse(vaseData)
        createTables(vaseData)
        update()
    }).fail(function (data) {
        if (debug) {
            console.log('failed to load default')
        }
    })
};

function getIndex() {
    if (debug) {
        console.log('load index attempt')
    }
    let access = $("#index-load-access").val()
    $.ajax({
        type: "POST",
        url: "getIndex",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(access),
    }).done(function (data) {
        if (debug) {
            console.log('indexes got')
            console.log(data)
        }
        indexList = JSON.parse(data)

        createIndexList(indexList)
    }).fail(function (data) {
        if (debug) {
            console.log('failed to get indexes')
        }
    })
}

function load(inputData = "") {
    if (debug) {
        console.log('load attempt')
    }
    $.ajax({
        type: "POST",
        url: "loadVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: inputData,
    }).done(function (data) {
        if (debug) {
            console.log('loaded vase')
        }
        let [vaseData, appearance, downloads] = JSON.parse(data)

        vaseData = JSON.parse(vaseData)
        appearance = JSON.parse(appearance)
        vaseData.downloads = JSON.parse(downloads)

        transistionApperance(appearance)
        vaseData["name"] = JSON.parse(inputData).name
        username = JSON.parse(inputData).user
        setAllTables(vaseData)
        transition()
    }).fail(function (data) {
        if (debug) {
            console.log('failed to load vase')
        }
    })
}

function loadRandom() {
    if (debug) {
        console.log('load random attempt')
    }
    $.ajax({
        type: "GET",
        url: "loadRandom",
        contentType: "application/json; charset=utf-8",
        traditional: true
    }).done(function (data) {
        if (debug) {
            console.log('loaded random vase')
        }
        let [vaseData, appearance, downloads] = JSON.parse(data)

        vaseData = JSON.parse(vaseData)
        appearance = JSON.parse(appearance)
        vaseData.downloads = JSON.parse(downloads)

        // setApperance(appearance)
        vaseData["name"] = $("#input-name").val()
        username = ""
        setAllTables(vaseData)
        update()
    }).fail(function (data) {
        if (debug) {
            console.log('failed to load vase')
        }
    })
}

export function incrementDownloads() {
    const data = {
        "name": $("#input-name").val(),
        "user": username
    }
    if (debug) {
        console.log('increment vase download attempt')
    }
    $.ajax({
        type: "POST",
        url: "incrementDownload",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(data),
    }).done(function (data) {
        if (debug) {
            console.log('deleted vase')
        }
    }).fail(function (data) {
        if (debug){
            console.log("Increment downloads failed");
        }
    })
}

function deleteVase(name = "") {
    if (debug) {
        console.log('delete vase attempt')
    }
    $.ajax({
        type: "POST",
        url: "deleteVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(name),
    }).done(function (data) {
        if (debug) {
            console.log('deleted vase')
        }
        let vaseData = JSON.parse(data)
        $("#index-table").remove()
        getIndex()
        vaseData["name"] = name
        setAllTables(vaseData)
        update()
    }).fail(function (data) {
        if (debug){
            console.log("Delete attempt failed.");
        }
    })
};

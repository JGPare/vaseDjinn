
const debug = false

export default class ControlPanelView
{
  constructor(controlPanelVM)
  {
    this.controlPanelVM = controlPanelVM
    this.startRow = 0
    this.displayNum = 10

    this.tablesMade = false
    this.setHandles()
  }

  setHandles()
  {
    // button actions 
    $(document).on("click", '#vaseLoader',(event) => {
      event.stopPropagation()
      event.stopImmediatePropagation()
      let data = event.target.getAttribute("data")
      this.controlPanelVM.load(data)
    })

    $("#load-vase").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      $("#index-table").remove()
      const access = $("#index-load-access").val()
      this.controlPanelVM.getIndex(access)
      $("#myForm").toggle()
      $("#index-outer-container").toggle()
    })

    $("#load-random").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      this.controlPanelVM.loadRandom()
    })

    $(document).on("change", "#index-load-access",(event) => {
      event.stopPropagation()
      $("#index-table").remove()
      const access = $("#index-load-access").val()
      this.controlPanelVM.getIndex(access)
    })

    $("#edit-vase").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      $("#index-outer-container").toggle()
      $("#myForm").toggle()
    })

    $("#delete-vase").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      this.controlPanelVM.deleteVase($("#input-name").val())
      $("#input-name").val("GregTheVase")
    })

    $(document).on("click", '#down-arrow-button',(event) => {
      event.stopPropagation()
      $("#index-table").remove()
      this.createIndexList(this.controlPanelVM.indexList, 1)

    })

    $(document).on("click", '#up-arrow-button',(event) => {
      event.stopPropagation()
      $("#index-table").remove()
      this.createIndexList(this.controlPanelVM.indexList, -1)
    })

    $(document).on("input", ".form-range",(event) => {
      if (debug) {
          console.log("slider change")
      }
      let range = $(event.target)
      this.setNumberText(range)
      this.update()
      event.stopPropagation()
    })

    $('#myForm').submit( (event) => 
    {
      this.saveVase(event)
    })

    this.controlPanelVM.on('vaseLoaded',() => 
    {
      if (this.tablesMade)
      {
        this.setAllTables(this.controlPanelVM.vaseData)
      }
      else
      {
        this.createTables(this.controlPanelVM.vaseData)
      }
    })
    
    this.controlPanelVM.on('indexListLoaded',() => 
    {
      this.createIndexList(this.controlPanelVM.indexList)
    })
    
    this.controlPanelVM.on('update',() => 
    {
      this.update()
    })
  }

  createRange(name, value = 50, min = 0, max = 100, step = 1) 
  {
    let inputGroup = $("<div></div>")[0]
    inputGroup.setAttribute("class", "input-group")

    let range = $("<input>")[0]
    range.setAttribute("class", "form-range my-range form-control pe-1")
    range.setAttribute("type", "range")
    range.setAttribute("name", name)
    range.setAttribute("value", value)
    range.setAttribute("min", min)
    range.setAttribute("max", max)
    range.setAttribute("step", step)

    let appendDiv = $("<div></div>")[0]
    appendDiv.setAttribute("class", "input-group-append")

    let number = $("<span></span>").html(value.toString())[0]
    number.setAttribute("class", "input-group-text number-text")

    appendDiv.appendChild(number)

    inputGroup.appendChild(range)
    inputGroup.appendChild(appendDiv)

    return inputGroup
  }

  readAllTables() {
    let vaseObj = {}
    vaseObj["name"] = $("#input-name").val()
    vaseObj["access"] = $("#input-load-access").val()
    vaseObj["generic0"] = this.readTable("generic0-table")[0]
    vaseObj["generic1"] = this.readTable("generic1-table")[0]
    vaseObj["radial"] = this.readTable("radial-table")
    vaseObj["vertical"] = this.readTable("vertical-table")
    return vaseObj
  }

  setAllTables(vaseData) {
    this.setTable("generic0-table", [vaseData["generic0"]])
    this.setTable("generic1-table", [vaseData["generic1"]])
    this.setTable("radial-table", vaseData["radial"])
    this.setTable("vertical-table", vaseData["vertical"])
    if (debug) {
        console.log("set name", vaseData["name"])
    }
    $("#input-name").val(vaseData["name"])
  }

  readTable(parentID) {
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

  setTable(parentID, data) {
    let myRows = []
    const dataType = $("#" + parentID).attr("data")
    let $headers = $("#" + parentID + " > thead td")
    let $rows = $("#" + parentID + " > tbody tr ").each(function (index) {
        let $cells = $(this).find("td")
        $cells.each(function (cellIndex) {
            const key = $($headers[cellIndex]).attr("data")
            let range = $(this).find("input")
            range.val(data[index][key])
            this.setNumberText(range)
        })
    })
  }

  createTables(data) {

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

    const settings = this.controlPanelVM.settings
    
    row.insertCell(0).appendChild(this.createRange(
        "height",
        generic0.height,
        settings.height.min,
        settings.height.max,
        settings.height.step,))
    row.insertCell(1).appendChild(this.createRange(
        "width",
        generic0.width,
        settings.width.min,
        settings.width.max,
        settings.width.step,))
    row.insertCell(2).appendChild(this.createRange(
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
    row.insertCell(0).appendChild(this.createRange(
        "verticalSteps",
        generic1.vertical_steps,
        settings.vertical_steps.min,
        settings.vertical_steps.max,
        settings.vertical_steps.step,
    ))
    row.insertCell(1).appendChild(this.createRange(
        "radialSteps",
        generic1.radial_steps,
        settings.radial_steps.min,
        settings.radial_steps.max,
        settings.radial_steps.step,
    ))
    row.insertCell(2).appendChild(this.createRange(
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

        row.insertCell(1).appendChild(this.createRange(
            "r" + i + "_mag",
            radials[i].mag,
            settings.radial_mag.min,
            settings.radial_mag.max,
            settings.radial_mag.step,
        ))
        row.insertCell(2).appendChild(this.createRange(
            "r" + i + "_freq",
            radials[i].freq,
            settings.radial_freq.min,
            settings.radial_freq.max,
            settings.radial_freq.step,
        ))
        row.insertCell(3).appendChild(this.createRange(
            "r" + i + "_twist",
            radials[i].twist,
            settings.radial_twist.min,
            settings.radial_twist.max,
            settings.radial_twist.step,
        ))
        row.insertCell(4).appendChild(this.createRange(
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

        row.insertCell(1).appendChild(this.createRange(
            "v" + i + "_mag",
            verticals[i].mag,
            settings.vertical_mag.min,
            settings.vertical_mag.max,
            settings.vertical_mag.step,
        ))
        row.insertCell(2).appendChild(this.createRange(
            "v" + i + "_freq",
            verticals[i].freq,
            settings.vertical_freq.min,
            settings.vertical_freq.max,
            settings.vertical_freq.step,
        ))
        row.insertCell(3).appendChild(this.createRange(
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
  }

  createIndexList(indexList, offsetDir = 0) {

    this.startRow += offsetDir * (this.displayNum - 1)
    let endRow = this.startRow + this.displayNum
    if (endRow > indexList.length) {
        endRow = indexList.length
    } else if (this.startRow < 0) {
        this.startRow = 0
    }

    const indexHeaders = ["Vase Name", "Creator", "Downloads"]

    let table = $("<table>")[0]
    table.setAttribute("class", "table table-dark table-hover my-dark-table text-center")
    table.setAttribute("id", "index-table")
    table.setAttribute("data", "index")

    let i = 0
    if (this.startRow > 0) {
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

    for (; i + this.startRow < endRow && i < this.displayNum; i++) {

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

        name.text(indexList[i + this.startRow].name)
        user.text(indexList[i + this.startRow].user)
        downloads.text(indexList[i + this.startRow].downloads)

        buttonName.attr("data", JSON.stringify(indexList[i + this.startRow]))
        buttonUser.attr("data", JSON.stringify(indexList[i + this.startRow]))
        buttonDownloads.attr("data", JSON.stringify(indexList[i + this.startRow]))

        name.attr("data", JSON.stringify(indexList[i + this.startRow]))
        user.attr("data", JSON.stringify(indexList[i + this.startRow]))

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

  update() {
    const data = this.readAllTables()
    this.controlPanelVM.setVase(data)
  }

  setNumberText(range) {
    const rangeName = range.attr("name")
    range.next("div").children("span").html(range.val())
  }

}

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
    // get the row from the target, grab the data from it
    $("#index-container").on('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      const $tr = $(event.target).closest('tr')
      if ($tr.attr('id') == 'up-arrow-row')
      {
        $("#index-table").remove()
        this.createIndexList(this.controlPanelVM.indexList, -1)
      }
      else if ($tr.attr('id') == 'down-arrow-row')
      {
        $("#index-table").remove()
        this.createIndexList(this.controlPanelVM.indexList, 1)
      }
      else
      {
        const data = $tr.attr('data-load')
        if (data)
        {
          this.controlPanelVM.load(data)
        }
      }
    })

    $("#load-vase").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      const access = $("#index-load-access").val()
      this.controlPanelVM.access = access
      this.controlPanelVM.getIndex()
      $("#index-table").remove()
      $("#myForm").hide()
      $("#index-outer-container").show()
    })

    $("#load-random").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      this.controlPanelVM.loadRandom()
    })

    $("#index-load-access").on('change',(event) => {
      event.stopPropagation()
      $("#index-table").remove()
      const access = $("#index-load-access").val()
      this.controlPanelVM.access = access
      this.controlPanelVM.getIndex()
    })

    $("#edit-vase").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      $("#index-outer-container").hide()
      $("#myForm").show()
    })

    $("#delete-vase").on("click",(event) => {
      event.preventDefault()
      event.stopPropagation()
      this.controlPanelVM.deleteVase($("#input-name").val())
      $("#input-name").val("GregTheVase")
    })

    // link the number text to the slider
    $(document).on("input", ".form-range",(event) => {
      if (debug) {
          console.log("slider change")
      }
      let range = $(event.target)
      this.setNumberText(range)
      this.update()
      event.stopPropagation()
    })

    // save button
    $('#myForm').submit( (event) => 
    {
      event.preventDefault() // Prevent the form from submitting via the browser
      const data = this.readAllTables()
      this.controlPanelVM.saveVase(data)
      $('input[name="height"]').focus()
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
        this.tablesMade = true
      }
      this.update()
    })
    
    this.controlPanelVM.on('indexListLoaded',() => 
    {
      this.createIndexList(this.controlPanelVM.indexList)
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
    let $rows = $("#" + parentID + " > tbody tr ").each((rowIndex, rowElement) => {
        let $cells = $(rowElement).find("td")
        myRows[rowIndex] = {}
        $cells.each((cellIndex, cellElement) => {
            const value = $(cellElement).find("input").val()
            const key = $($headers[cellIndex]).attr("data")
            myRows[rowIndex][key] = value
        })
    })
    return dataType, myRows
  }

  setTable(parentID, data) {
    const dataType = $("#" + parentID).attr("data");
    const $headers = $("#" + parentID + " > thead td");
    const $rows = $("#" + parentID + " > tbody tr");

    $rows.each((rowIndex, rowElement) => {
        const $cells = $(rowElement).find("td");
        
        $cells.each((cellIndex, cellElement) => {
            const key = $($headers[cellIndex]).attr("data");
            const range = $(cellElement).find("input");
            
            range.val(data[rowIndex][key]);
            this.setNumberText(range);
        });
    });
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

    let $table = $("<table></table>", {
      class: "table table-dark table-hover my-dark-table text-center",
      id: "index-table",
      data: "index",
    })

    // Create and populate table header
    let $header = $("<thead></thead>").appendTo($table)
    let $headerRow = $("<tr></tr>").appendTo($header)

    indexHeaders.forEach(headerText => {
      $("<td></td>", {
        style: "padding: 0.5rem",
        html: headerText,
      }).appendTo($headerRow)
    })

    const $body = $("<tbody></tbody>").appendTo($table)
    let i = 0

    // Add "up-arrow" row if needed
    if (this.startRow > 0) {
      let $row = $("<tr></tr>", {
        style: "width: 2rem; height: 2rem;",
        id: "up-arrow-row",
      }).appendTo($body)

      let $button = $("<a></a>", {
        class: "btn text-light h-100 w-100 py-0",
      })

      let $img = $("<img>", {
        src: upArrow,
        style: "width: 2rem; height: 2rem;",
      })

      $button.append($img)
      $row.append($("<td></td>"), $("<td></td>").append($button), $("<td></td>"))
      i++
    }

    for (; i + this.startRow < endRow && i < this.displayNum; i++) {
        const rowData = indexList[i + this.startRow];

        let $row = $("<tr></tr>", {
          'data-load': JSON.stringify(rowData)
        }).appendTo($body);

        let $buttonName = $("<a></a>", {
            class: "btn d-flex justify-content-center text-light h-100 w-100",
        }).append($("<p></p>", {
            class: "text-start mb-0",
            text: rowData.name,
        }));

        let $buttonUser = $("<a></a>", {
            class: "btn d-flex justify-content-center text-light h-100 w-100",
        }).append($("<p></p>", {
            class: "text-end mb-0 text-secondary",
            text: rowData.user,
        }));

        let $buttonDownloads = $("<a></a>", {
            class: "btn d-flex justify-content-center text-light h-100 w-100",
        }).append($("<p></p>", {
            class: "text-end mb-0 text-secondary",
            text: rowData.downloads,            
        }));

        // Append buttons to table row
        $row.append(
            $("<td></td>").append($buttonName),
            $("<td></td>").append($buttonUser),
            $("<td></td>").append($buttonDownloads)
        );
    };

    // Add "down-arrow" row if needed
    if (endRow != indexList.length) {
      let $row = $("<tr></tr>", {
        style: "width: 2rem; height: 2rem;",
        id: "down-arrow-row"
      }).appendTo($body)

      let $button = $("<a></a>", {
        class: "btn text-light h-100 w-100 py-0",
      })

      let $img = $("<img>", {
        src: downArrow,
        style: "width: 2rem; height: 2rem;",
      })

      $button.append($img)
      $row.append($("<td></td>"), $("<td></td>").append($button), $("<td></td>"))
    }

    // Append the table to the container
    $("#index-container").empty().append($table);
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
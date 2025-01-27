
import Experience from "../Experience"
import EventEmitter from "../Utility/EventEmitter"

const debug = true

export default class ControlPanelViewModel extends EventEmitter
{
  constructor() {
    super()
    this.experience = new Experience()
    this.username = ""
    this.settings = null
    this.vaseData = null
    this.appearance = null
    this.access = 'public'

    // index table
    this.indexList = []
  }

  onLoad()
  {
    this.visualizer = this.experience.visualizer
    this.loadSettings()
  }

  setVase(data)
  {
    this.vaseData = data
    this.visualizer.setVase(this.vaseData)
  }

  load(inputData = "") {
    if (debug) {
        console.log('load attempt')
    }
    $.ajax({
        type: "POST",
        url: "loadVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: inputData,
    }).done( (data) => {
        if (debug) {
            console.log('loaded vase')
        }
        let [vaseData, appearance, downloads] = JSON.parse(data)

        this.vaseData = JSON.parse(vaseData)
        this.appearance = JSON.parse(appearance)
        this.vaseData.downloads = JSON.parse(downloads)

        this.visualizer.setApperance(this.appearance)
        this.vaseData["name"] = JSON.parse(inputData).name
        this.username = JSON.parse(inputData).user
        this.trigger('vaseLoaded')
    }).fail( (data) => {
        if (debug) {
            console.log('failed to load vase')
        }
    })
  }


  loadSettings() {
    if (debug) {
        console.log('setting load attempt')
    }
    $.ajax({
        type: "POST",
        url: "loadSettings",
        data: "",
    }).done((data) => {
        if (debug) {
            console.log('loaded settings')
        }
        this.settings = JSON.parse(data)
        this.loadDefault()
    }).fail( (data) => {
        if (debug) {
            console.log('failed to load settings')
        }
    })
  }

  loadDefault(name = "") {
    if (debug) {
        console.log('load default attempt')
    }
    $.ajax({
        type: "POST",
        url: "loadVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(""),
    }).done((data) => {
        if (debug) {
            console.log('loaded default vase')
        }
        let [vaseData, appearance, downloads] = JSON.parse(data)
        this.vaseData = JSON.parse(vaseData)
        this.trigger('vaseLoaded')
    }).fail( (data) => {
        if (debug) {
            console.log('failed to load default')
        }
    })
  }

  saveVase(data)
  {
    if (debug) {
        console.log('save attempt attempt')
    }
    data["appearance"] = this.visualizer.getApperance()
    $.ajax({
        type: "POST",
        url: "saveVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(data),
    }).done(function (data) {
        if (debug) {
            console.log('vase saved')
        }
    }).fail(function (data) {
        if (debug) {
            console.log("Save attempt failed.")
        }
    })
  }

  getIndex() {
    if (debug) {
        console.log('load index attempt')
    }
    $.ajax({
        type: "POST",
        url: "getIndex",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(this.access),
    }).done((data) => {
        if (debug) {
            console.log('indexes got')
        }
        this.indexList = JSON.parse(data)
        this.trigger('indexListLoaded')
    }).fail( (data) => {
        if (debug) {
            console.log('failed to get indexes')
        }
    })
  }

  loadRandom() {
    if (debug) {
        console.log('load random attempt')
    }
    $.ajax({
        type: "GET",
        url: "loadRandom",
        contentType: "application/json; charset=utf-8",
        traditional: true
    }).done((data) => {
        if (debug) {
            console.log('loaded random vase')
        }
        let [vaseData, appearance, downloads] = JSON.parse(data)

        this.vaseData = JSON.parse(vaseData)
        this.appearance = JSON.parse(appearance)
        this.vaseData.downloads = JSON.parse(downloads)

        this.vaseData["name"] = $("#input-name").val()
        this.trigger('vaseLoaded')
        this.trigger('update')
    }).fail( (data) => {
        if (debug) {
            console.log('failed to load vase')
        }
    })
  }

  incrementDownloads() {
    const data = {
        "name": $("#input-name").val(),
        "user": this.username
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
    }).done((data) => {
        if (debug) {
            console.log('increment vase')
        }
    }).fail((data) => {
        if (debug) {
            console.log("Increment downloads failed")
        }
    })
  }

  deleteVase(name = "") 
  {
    if (debug) {
        console.log('delete vase attempt')
    }
    $.ajax({
        type: "POST",
        url: "deleteVase",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        data: JSON.stringify(name),
    }).done( (data) => {
        if (debug) {
            console.log('deleted vase')
        }
        this.vaseData = JSON.parse(data)
        $("#index-table").remove()
        this.getIndex('public')
        this.vaseData["name"] = name
        this.trigger('vaseLoaded')
        this.trigger('update')
    }).fail( (data) => {
        if (debug) {
            console.log("Delete attempt failed.")
        }
    })
  }
}
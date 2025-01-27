import ControlPanelView from "./ControlPanel/ControlPanelView"
import ControlPanelViewModel from "./ControlPanel/ControlPanelViewModel"
import Visualizer from "./Visualizer/Visualizer"

let instance = null

export default class Experience
{
  constructor() 
  {
    // Singleton
    if (instance) 
    {
      return instance
    }
    instance = this
    this.controlPanelVM = new ControlPanelViewModel()
    this.visualizer = new Visualizer()
    this.controlPanel = new ControlPanelView(this.controlPanelVM)

    this.loaded()
  }

  loaded()
  {
    this.visualizer.controlPanelVM = this.controlPanelVM
    this.controlPanelVM.onLoad()
  }

}
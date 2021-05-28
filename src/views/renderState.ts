import { ComponentState } from "../lib/appState";
import { ComponentMessage } from '../lib/appMessages';
import { renderViewingState } from './renderViewingState';
import { renderWaitingState } from './renderWaitingState';

type Dispatch = (msg: ComponentMessage) => void;
type RenderView = (state: ComponentState, dispatch: Dispatch) => HTMLElement;

export function render(state: ComponentState, dispatch: Dispatch): void {
    let renderView: RenderView;
    let rootNode = document.getElementById("root");

    if (state?.gameRoomId) {
        renderView = renderViewingState;
    } else {
        renderView = renderWaitingState;
    }

    //No need to import (and maintain) an entire component library and its customs for this small app...
    //All of the states are cleanly defined
    var emptyNode = rootNode.cloneNode(false);
    //Clears the root node
    rootNode.parentNode.replaceChild(emptyNode, rootNode);
    //Appens the child to the root node
    emptyNode.appendChild(renderView(state, dispatch));
}
import './styles/style.scss';

import { AppMessage, ComponentMessage } from './lib/appMessages';
import { AppState } from './lib/appState';
import { render } from './views/renderState';
import { isValidPokerNowUrl } from './lib/validation';
import { ClientInfo } from '@kosy/kosy-app-api/types';
import { KosyApi } from '@kosy/kosy-app-api';
import axios from 'axios';

module Kosy.Integration.Youtube {
    export class App {
        private state: AppState = { gameRoomId: null };
        private initializer: ClientInfo;
        private currentClient: ClientInfo;

        private kosyApi = new KosyApi<AppState, AppMessage, AppMessage>({
            onClientHasJoined: (clientInfo) => this.onClientHasJoined(clientInfo),
            onClientHasLeft: (clientUuid) => this.onClientHasLeft(clientUuid),
            onReceiveMessageAsClient: (message) => this.processMessage(message),
            onReceiveMessageAsHost: (message) => message,
            onRequestState: () => this.getState(),
            onProvideState: (newState: AppState) => this.setState(newState)
        })

        public async start() {
            let initialInfo = await this.kosyApi.startApp();
            this.initializer = initialInfo.clients[initialInfo.initializerClientUuid];
            this.currentClient = initialInfo.clients[initialInfo.currentClientUuid];
            this.state = initialInfo.currentAppState ?? this.state;
            this.renderComponent();

            if (this.state.gameRoomId == null && this.initializer.clientUuid == this.currentClient.clientUuid) {
                this.generatePokerUrl();
            }

            window.addEventListener("message", (event: MessageEvent<ComponentMessage>) => {
                this.processComponentMessage(event.data)
            });
        }

        private generatePokerUrl() {
            axios
                .get('https://51e92853d1f4.ngrok.io/create-room')
                .then(res => {
                    if (res.data) {
                        this.state.gameRoomId = res.data.gameID;
                        console.log(res.data.gameID);
                        this.renderComponent();
                    } else {
                        console.error("Server was not able to create a game room id");
                    }
                })
                .catch(error => {
                    console.error(error);
                })
        }

        public setState(newState: AppState) {
            this.state = newState;
            this.renderComponent();
        }

        public getState() {
            return this.state;
        }

        public onClientHasJoined(clientInfo: ClientInfo) {

        }

        public onClientHasLeft(clientUuid: string) {
            if (clientUuid === this.initializer.clientUuid && !this.state.gameRoomId) {
                this.kosyApi.stopApp();
            }
        }

        public processMessage(message: AppMessage) {
            switch (message.type) {
                case "receive-poker-url":
                    if (isValidPokerNowUrl(message.payload)) {
                        this.state.gameRoomId = `${message.payload}`;
                        this.renderComponent();
                    }
                    break;
            }
        }

        private processComponentMessage(message: ComponentMessage) {
            switch (message.type) {
                case "poker-url-changed":
                    //Notify all other clients that the figma url has changed
                    this.kosyApi.relayMessage({ type: "receive-poker-url", payload: message.payload });
                    break;
                default:
                    break;
            }
        }

        //Poor man's react, so we don't need to fetch the entire react library for this tiny app...
        private renderComponent() {
            render({
                gameRoomId: this.state.gameRoomId,
                currentClient: this.currentClient,
                initializer: this.initializer,
            }, (message) => this.processComponentMessage(message));
        }

        private log(...message: any) {
            console.log(`${this.currentClient?.clientName ?? "New user"} logged: `, ...message);
        }
    }

    new App().start();
}
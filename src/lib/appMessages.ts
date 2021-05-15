/// Messages that are relayed to all of the clients
export type AppMessage =
    | ReceivePokerUrl

export interface ReceivePokerUrl {
    type: "receive-poker-url";
    payload: string;
}

/// Internal component messages
export type ComponentMessage =
    | PokerUrlHasChanged

export interface PokerUrlHasChanged {
    type: "poker-url-changed";
    payload: string;
}


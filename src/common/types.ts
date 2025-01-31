import { IconType } from "@react-icons/all-files";

export const enum Command {
  TOGGLE_TAB_SEARCH = "toggle-tab-search",
  TOGGLE_TAB_ACTIONS = "toggle-tab-actions",
  TOGGLE_TAB_BOOKMARKS = "toggle-tab-bookmarks",
  TOGGLE_TAB_HISTORY = "toggle-tab-history",
}

// name space Messages according to their use using a union(?) of enums
// type Message =  CommandMessage | TabSearchMessage | TabActionMessage
export const enum Message {
  // command specific
  TOGGLE_TAB_SEARCH = "toggle-search",
  TOGGLE_TAB_ACTIONS = "toggle-actions",
  TOGGLE_TAB_HISTORY = "toggle-history",

  // tab search specific
  GET_TAB_DATA = "get-tab-data",
  GET_HISTORY_DATA = "get-history-data",

  CHANGE_TAB = "change-tab",
  TAB_DATA_UPDATE = "tab-data-update",

  CLOSE_GIVEN_TAB = "close-given-tab", // used to close a given tab
  TOGGLE_MUTE_GIVEN_TAB = "toggle-mute-given-tab",
  TOGGLE_PIN_GIVEN_TAB = "toggle-pin-given-tab",

  // tab action specific
  CLOSE_CURRENT_TAB = "close-current-tab",
  CLOSE_CURRENT_WINDOW = "close-current-window",
  OPEN_NEW_TAB = "open-new-tab",
  OPEN_NEW_WINDOW = "open-new-window",
  OPEN_INCOGNITO_WINDOW = "open-incognito-window",

  TOGGLE_PIN_CURRENT_TAB = "toggle-pin-tab",
  TOGGLE_MUTE_CURRENT_TAB = "toggle-mute-tab",
  DUPLICATE_TAB = "duplicate-tab",
  CLOSE_DUPLICATE_TABS = "close-duplicate-tabs",
  CLOSE_OTHER_TABS = "close-other-tabs",

  CHECK_SEARCH_OPEN = "check-search-open",

  OPEN_GITHUB = "open-github",
  OPEN_YOUTUBE = "open-youtube",
  OPEN_GOOGLE = "open-google",
  OPEN_TWITTER = "open-twitter",
  OPEN_FACEBOOK = "open-facebook",
  OPEN_HISTORY_ITEM = "open-history-item",

  // when workspaces are implemented, related actions will be here

  ERROR = "error",
}

export const enum SearchMode {
  TAB_ACTIONS = "tab-actions",
  TAB_SEARCH = "tab-search",
  TAB_HISTORY = "tab-history",
}

export function getSearchModeFromMessage(message: Message): SearchMode {
  switch (message) {
    case Message.TOGGLE_TAB_ACTIONS:
      return SearchMode.TAB_ACTIONS;

    case Message.TOGGLE_TAB_SEARCH:
      return SearchMode.TAB_SEARCH;

    case Message.TOGGLE_TAB_HISTORY:
      return SearchMode.TAB_HISTORY;

    default:
      return SearchMode.TAB_SEARCH
  }
}


export interface MessagePlayload {
  message: Message;
  // message: string
  // data: TabData[]
}

export interface ChangeTabPayload extends MessagePlayload {
  // use GivenTabMessagePayload
  message: Message.CHANGE_TAB;
  // just send the TabData?
  tabId: number;
  windowId: number;
}

export interface GivenTabPayload extends MessagePlayload {
  // generic interface to handle tabs actions for a given tab
  tabId: number;
}

export interface TogglePinTabPayload extends GivenTabPayload {
  isPinned: boolean;
}

export interface ToggleMuteTabPayload extends GivenTabPayload {
  tabId: number;
  isMuted: boolean;
}

export interface UpdatedTabDataPayload extends MessagePlayload {
  message: Message.TAB_DATA_UPDATE;
  updatedTabData: TabData[];
}

export interface OpenHistoryItemPayload extends MessagePlayload {
  message: Message.OPEN_HISTORY_ITEM;
  url: string;
}

export type Data = TabData | ActionData | HistoryData;

export interface TabData {
  tabId: number;
  windowId: number;
  favIcon: string | null;
  tabTitle: string;
  tabUrl: string;
  inCurrentWindow: boolean;
  isAudible: boolean;
  isMuted: boolean;
  isPinned: boolean;
}

export interface ActionData {
  name: string;
  message: Message; // the message that the action sends to the backgrpond sctipt
  icon: IconType; // for now
  iconColor?: string;
}

export interface HistoryData {
  title: string,
  url: string,
  timeVisited: number
}

export interface SideBarItem {
  searchMode: SearchMode;
  icon: IconType;
}

export interface CheackSearchOpenResponse {
  isOpen: boolean;
  currentSearchMode: SearchMode;
}

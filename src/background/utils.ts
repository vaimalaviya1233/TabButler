import { isBrowserURL } from "../common/common";
import {
  CheackSearchOpenResponse,
  Command,
  HistoryData,
  Message,
  SearchMode,
  TabData,
  UpdatedTabDataPayload,
} from "../common/types";
import browser from "webextension-polyfill";

export async function getCurrentTab() {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export async function getTabsWithSearchOpen(): Promise<number[]> {
  // get the active tabs that have an open tab search modal
  // we only want the active tab as that is the only place it can be in
  // get the tab in the window with search modal open and in tab search mode
  // in development, if the there are multiple windows and one of the active tabs in those windows has an isolated content script,
  // it will cause an error
  const activeTabs = await browser.tabs.query({
    active: true,
    status: "complete",
  }); // can only communicate with tabs that are completely loaded
  console.log(activeTabs);
  const activeTabsLength = activeTabs.length;
  const result: number[] = [];
  for (let i = 0; i < activeTabsLength; i++) {
    const activeTab = activeTabs[i];
    if (activeTab?.id && activeTab.url && !isBrowserURL(activeTab.url)) {
      // if the page has an old content script, then it will throw an error
      const respose: CheackSearchOpenResponse = await browser.tabs.sendMessage(
        activeTab.id,
        {
          message: Message.CHECK_SEARCH_OPEN,
        },
      );
      if (
        respose &&
        respose.isOpen &&
        respose.currentSearchMode === SearchMode.TAB_SEARCH
      ) {
        result.push(activeTab.id);
      }
    }
  }

  return result;
}

export async function getTabsInBrowser(activeTabId?: number) {
  // should it return the current tab??
  // should we be using the lastFocused?
  const tabs = await browser.tabs.query({});
  let currentWindowId: number | undefined;
  // if the active tab is provided, use the currentWindow of that tab
  if (activeTabId !== undefined) {
    currentWindowId = (await browser.tabs.get(activeTabId)).windowId;
  } else {
    // for windows, the current window is the window that the code is being run from (not what we need)
    currentWindowId = (await browser.windows.getLastFocused()).id;
  }
  const results: TabData[] = [];
  const tabNum = tabs.length;

  for (let i = 0; i < tabNum; i++) {
    const tab = tabs[i];
    if (
      tab.id &&
      tab.id !== browser.tabs.TAB_ID_NONE &&
      tab.url &&
      tab.windowId &&
      tab.windowId !== browser.windows.WINDOW_ID_NONE
    ) {
      // we know that these properties will be present
      const tabData: TabData = {
        tabId: tab.id,
        windowId: tab.windowId,
        favIcon: tab.favIconUrl || null,
        tabTitle: tab.title as string, // we know this will be present
        tabUrl: tab.url.split("?")[0], // removes the query string (should I do this her eor in the SearchMdoal on search?)
        inCurrentWindow: currentWindowId === tab.windowId,
        isAudible: Boolean(tab.audible), // if undefined, it will return false
        isMuted: Boolean(tab?.mutedInfo?.muted), // think about this
        isPinned: tab.pinned,
        // muted info
      };
      results.push(tabData);
    }
  }

  return results;
}

export async function getHistoryData() {
  // how many history items should i be showing???
  // in what timeframe
  const history = await browser.history.search({ text: ""});
  const results: HistoryData[] = [];

  const historyNum = history.length;
  for (let i = 0; i < historyNum; i++) {
    const { title, url, lastVisitTime} = history[i];
    if (title && url && lastVisitTime !== undefined) {
      results.push({
        title,
        url,
        timeVisited: lastVisitTime

      })
    }
  }

  return results;
}

export async function injectExtension() {
  const manifest = browser.runtime.getManifest();
  // we know that these values will be present
  const extensionContentScripts = manifest.content_scripts![0].js!;
  // const extensionCss = manifest.content_scripts![0].css!;
  // inject the extension into all tabs
  const tabs = await browser.tabs.query({ status: "complete" }); // think about this
  const tabsLength = tabs.length;
  // use while loop?
  // this is O(n);
  for (let i = 0; i < tabsLength; i++) {
    const tab = tabs[i];
    if (
      tab.id &&
      tab.id !== browser.tabs.TAB_ID_NONE &&
      tab.url && // tab.url is only present if the permission is present, which it is
      !isBrowserURL(tab?.url)
    ) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: extensionContentScripts,
      });
      // await browser.scripting.insertCSS({
      //   target: { tabId: tab.id, allFrames: false },
      //   files: extensionCss,
      // });
    }
  }
  // popular way I have seen it done in othe extensions, this changes the time complexity to O(n^2)

  // const windows = await browser.windows.getAll({ populate: true}); // what does populate mean
  // const windowLength = windows.length;
  // for (let i = 0; i < windowLength; i++) {
  //   const window = windows[i];
  //   const tabs = window.tabs;
  //   if (tabs) {
  //     const tabsLength = tabs.length;
  //     for (let j = 0; j < tabsLength; j++) {
  //       const tab = tabs[j];
  //       console.log(tab);
  //       if (
  //         tab.id &&
  //         tab.id !== browser.tabs.TAB_ID_NONE &&
  //         tab.url && // tab.url is only present if the permission is present, which it is
  //         !isChromeURL(tab?.url)
  //         && tab?.status === "complete"
  //       ) {
  //         await browser.scripting.executeScript({
  //           target: { tabId: tab.id, allFrames: false },
  //           files: extensionContentScripts,
  //         });
  //         await browser.scripting.insertCSS({
  //           target: { tabId: tab.id, allFrames: false },
  //           files: extensionCss
  //         });
  //       }
  //     }
  //   }
  // }
}

export const reactOnTabUpdate = (removedTabId?: number) => {
  // send updated tab data to all open search modals in the browser
  getTabsWithSearchOpen().then((tabIds) => {
    console.log(tabIds);
    // for each active tab with their search open, send an update to them
    tabIds.forEach((id) => {
      // passing in the id for each active tab makes sure the currentWindow is correct
      getTabsInBrowser(id).then((updatedTabData) => {
        // there is a bug in firefox where the removed tab is still given in the tabData array
        if (removedTabId !== undefined) {
          const removedTabDataIndex = updatedTabData.findIndex(
            (tabData) => tabData.tabId === removedTabId,
          );
          if (removedTabDataIndex != -1) {
            updatedTabData.splice(removedTabDataIndex, 1);
          }
        }
        const messagePayload: UpdatedTabDataPayload = {
          message: Message.TAB_DATA_UPDATE,
          updatedTabData,
        };
        console.log("sending message");
        browser.tabs.sendMessage(id, messagePayload);
      });
    });
  });
  // }
};

export const checkCommands = async () => {
  // simple function to check if ther are any unbound commands due to conflicts
  const commands = await browser.commands.getAll();
  for (const { shortcut } of commands) {
    if (!shortcut) return true;
  }
  return false;
};

export function getMessageFromCommand(command: Command): Message {
  switch (command) {
    case Command.TOGGLE_TAB_ACTIONS:
      return Message.TOGGLE_TAB_ACTIONS;
  
    case Command.TOGGLE_TAB_SEARCH:
      return Message.TOGGLE_TAB_SEARCH;
  
    case Command.TOGGLE_TAB_HISTORY:
      return Message.TOGGLE_TAB_HISTORY;
  
    default:
      return Message.TOGGLE_TAB_SEARCH;
  }
}
import React from "react";
import { sideBarItems } from "../services/sidebar";
import {
  useSearchModalContext,
} from "./SearchModalContext";
import { createComponent } from "./utils";

const SideBarContainer = createComponent({ className: "side-bar" });
const SideBarItem = createComponent();

export const SideBar = () => {
  const { currentSearchMode, changeCurrentSearchMode, } =
    useSearchModalContext();
  return (
    <SideBarContainer>
      {sideBarItems.map(({ searchMode, icon: Icon }) => {
        const isSelected = currentSearchMode === searchMode;
        return (
          <SideBarItem
            key={searchMode}
            className={isSelected ? "side-bar-item-selected" : "side-bar-item"}
            onClick={() => {
              // MUST be batched together
              if (!isSelected) {
                // setIsLoading(true);
                // setCurrentSearchMode(searchMode);
                changeCurrentSearchMode(searchMode);
              }
            }}
          >
            {/* can do styling from scss */}
            <Icon
              size="32px"
              color={isSelected ? "#fff" : "rgba(255, 255, 255, 0.36)"}
            />
          </SideBarItem>
        );
      })}
    </SideBarContainer>
  );
};

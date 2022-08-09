// import createCache from "@emotion/cache";
// import { CacheProvider, css, Global } from "@emotion/react";
import React, { useEffect, useState } from "react";
import { SearchMode } from "../../common/types";
import styles from "../styles/styles.scss";
import { SearchModalContext } from "./SearchModalContext";
import { SearchViewContainer } from "./SearchViewContainer";

export interface Props {
  searchMode: SearchMode;
  close: () => void; // function to completely unmount the modal
}

export const SearchModal = (props: Props) => {
  const [currentSearchMode, setCurrentSearchMode] = useState<SearchMode>(
    props.searchMode,
  ); // make the inital value the searchMode that was passed in
  // puting the loading state here so it can be put in the 
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // console.log("props.searchMode updated");
    // only update the currentSearchmode if the incomming searchMode from the props is not the same as the current one
    // on mount, the value of currentSearch mode is set from the props so it should not be set again
    if (currentSearchMode !== props.searchMode) {
      // console.log("setting currentSearchMode with props.searchMode");
      // it is important to set loading to true here so that when the component rerenders after the currentSearchMode has changed, it renders the loading state, not the old data with incorrect components
      // updates are batched together
      setIsLoading(true);
      // loading is true as new data based on the new currentSearch mode is fetched
      setCurrentSearchMode(props.searchMode);
    }
  }, [props.searchMode]);

  return (
    <SearchModalContext.Provider
      value={{ close: props.close, currentSearchMode, setCurrentSearchMode, setIsLoading, isLoading }}
    >
      <style>{styles}</style>
      <div className="tab-butler-modal-body">
        <SearchViewContainer />
      </div>
    </SearchModalContext.Provider>
  );
};

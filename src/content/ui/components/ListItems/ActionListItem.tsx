import React from "react";
import { ActionData } from "../../../../common/types";
import { useIsDarkMode } from "../../hooks";
import { ListItem, ListItemProps, MainText, MainInfoContainer } from "./ListItem";

export const ActionListItem = ({
  data,
  onClick,
  onHover,
  selected,
}: ListItemProps<ActionData>) => {
  // const ref = useScroll(selected);
  // is it fine to be used like this???
  const isDarkMode = useIsDarkMode();
  const Icon = data.icon;
  return (
    <ListItem
      onClick={() => onClick(data)}
      selected={selected}
      onMouseOver={onHover}
    >
      <MainInfoContainer>
        <Icon
          size="24px"
          color={
            data.iconColor
              ? data.iconColor
              : isDarkMode
              ? "rgba(255, 255, 255, 0.36)"
              : "rgba(0, 0, 0, 0.36)"
          }
        />
        <MainText>{data.name}</MainText>
      </MainInfoContainer>
    </ListItem>
  );
};

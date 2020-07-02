import * as React from "react";
import "./dropdown.scss";

export type Positioning = "center" | "left" | "right";

export type Mode = "hover" | "click";

export type Props = {
  children: React.ReactNode;
  className?: string;
  dropdown: React.ReactNode;
  dropdownWrapperId?: string;
  hasClickOutsideListener?: boolean;
  isOpen?: boolean;
  mode?: Mode;
  positioning?: Positioning;
  wrapperId?: string;
  zIndex?: "auto" | number;
};

const clamp = ({ left = 0, top = 0, width = 0 }: Partial<DOMRect>) => {
  let leftCopy = left;

  if (leftCopy < 0) {
    leftCopy = 0;
  } else if (left + width > document.documentElement.clientWidth) {
    leftCopy = document.documentElement.clientWidth - width;
  }

  return { left: leftCopy, top };
};

function calculatePosition(
  refContainer: React.RefObject<HTMLDivElement>,
  refDropdown: React.RefObject<HTMLDivElement>,
  positioning: Positioning,
) {
  const dropdownPosition = refContainer?.current?.getBoundingClientRect() || {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };
  let { left } = dropdownPosition;
  const { top, width, height } = dropdownPosition;

  switch (positioning) {
    case "center":
      left += width / 2;
      left -= (refDropdown?.current?.getBoundingClientRect()?.width || 0) / 2;
      break;
    case "left":
      break;
    case "right":
      left += width;
      left -= refDropdown?.current?.getBoundingClientRect()?.width || 0;
      break;
    default:
      throw new Error(`Unknown positioning ${positioning}`);
  }

  const clamped = clamp({
    left,
    top,
    width: refDropdown?.current?.getBoundingClientRect().width || 0,
  });

  return { left: clamped.left, top: clamped.top + height };
}

function Dropdown({
  children,
  className = "dropdown",
  dropdown,
  dropdownWrapperId = undefined,
  hasClickOutsideListener = false,
  isOpen = undefined,
  mode = "hover",
  positioning = "left",
  wrapperId = undefined,
  zIndex = "auto",
  ...props
}: Props) {
  const [position, setPosition] = React.useState({ left: 0, top: 0 });
  const [shouldRenderContent, setShouldRenderContent] = React.useState(false);
  const [isDropdownShown, setIsDropdownShown] = React.useState(false);
  const refContainer = React.useRef<HTMLDivElement>(null);
  const refDropdown = React.useRef<HTMLDivElement>(null);

  const IS_CONTROLLED = !(typeof isOpen === "undefined" || isOpen === null);
  let modeCopy = mode;

  if (mode !== "hover" && mode !== "click") {
    console.error(
      "Use one of ['hover', 'click'] for mode prop. Defaulting to hover.",
    );
    modeCopy = "hover";
  }

  const calculatePositionAndSetState = React.useCallback(() => {
    if (shouldRenderContent) {
      const position = calculatePosition(
        refContainer,
        refDropdown,
        positioning,
      );
      setPosition(position);
    }
  }, [isDropdownShown, positioning]);

  React.useEffect(() => {
    window.addEventListener("scroll", calculatePositionAndSetState);
    window.addEventListener("resize", calculatePositionAndSetState);

    return () => {
      window.removeEventListener("scroll", calculatePositionAndSetState);
      window.removeEventListener("resize", calculatePositionAndSetState);
    };
  }, [calculatePositionAndSetState]);

  React.useEffect(() => {
    if (IS_CONTROLLED) {
      if (isOpen) {
        setShouldRenderContent(true);
      } else {
        setShouldRenderContent(false);
      }
    }
  }, [IS_CONTROLLED, isOpen]);

  React.useEffect(() => {
    if (shouldRenderContent) {
      const position = calculatePosition(
        refContainer,
        refDropdown,
        positioning,
      );
      setPosition(position);
      setIsDropdownShown(true);
    }
  }, [positioning, shouldRenderContent]);

  React.useEffect(() => {
    function outsideClickListener(event: MouseEvent) {
      if (!refContainer?.current?.contains(event.target as Node)) {
        setShouldRenderContent(false);
      }
    }

    if (hasClickOutsideListener && !IS_CONTROLLED) {
      window.addEventListener("click", outsideClickListener);
    }
    return () => window.removeEventListener("click", outsideClickListener);
  }, [IS_CONTROLLED, hasClickOutsideListener, positioning]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (mode === "hover") {
      if ([" ", "Enter"].includes(event.key)) {
        setShouldRenderContent((curr) => !curr);
      }
    }
    if (IS_CONTROLLED) {
      return;
    }
  }

  function onMouseEnter() {
    if (IS_CONTROLLED) {
      return;
    }
    if (modeCopy === "hover") {
      setShouldRenderContent(true);
    }
  }

  function onMouseLeave() {
    if (IS_CONTROLLED) {
      return;
    }
    if (modeCopy === "hover") {
      setShouldRenderContent(false);
    }
    return;
  }

  function onClick(event: React.MouseEvent) {
    if (IS_CONTROLLED) {
      return;
    }
    if (modeCopy === "click") {
      if (!refDropdown?.current?.contains(event.target as Node)) {
        setShouldRenderContent((curr) => !curr);
      }
    }
    return;
  }

  return (
    <div
      className={className}
      tabIndex={IS_CONTROLLED ? undefined : 0}
      role={IS_CONTROLLED ? undefined : "button"}
      onKeyDown={onKeyDown}
      id={wrapperId}
      ref={refContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      {...props}
    >
      {children}
      <div
        className={"dropdown-wrapper"}
        id={dropdownWrapperId}
        ref={refDropdown}
        style={{
          visibility: isDropdownShown ? "visible" : "hidden",
          top: position.top,
          left: position.left,
          zIndex,
        }}
      >
        {shouldRenderContent ? dropdown : null}
      </div>
    </div>
  );
}

export default Dropdown;

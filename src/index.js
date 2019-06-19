import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

const clamp = ({ left, top, width /* ,height */ }) => {
  let leftCopy = left;

  if (leftCopy < 0) {
    leftCopy = 0;
  } else if (left + width > document.documentElement.clientWidth) {
    leftCopy = document.documentElement.clientWidth - width;
  }

  // TODO clamp top based on a prop

  return { left: leftCopy, top };
};

function calculatePosition(refContainer, refDropdown, positioning) {
  const dropdownPosition =
    refContainer && refContainer.current.getBoundingClientRect();
  let { left } = dropdownPosition;
  const { top, width, height } = dropdownPosition;

  switch (positioning) {
    case "center":
      left += width / 2;
      left -= refDropdown.current.getBoundingClientRect().width / 2;
      break;
    case "left":
      break;
    case "right":
      left += width;
      left -= refDropdown.current.getBoundingClientRect().width;
      break;
    default:
      throw new Error(`Unknown positioning ${positioning}`);
  }

  const clamped = clamp({
    left,
    top,
    width: refDropdown && refDropdown.current.getBoundingClientRect().width,
    height: refDropdown && refDropdown.current.getBoundingClientRect().height,
  });

  return { left: clamped.left, top: clamped.top + height };
}

function Dropdown({
  mode = "hover",
  children,
  dropdown,
  wrapperClass,
  wrapperId,
  dropdownWrapperClass,
  dropdownWrapperId,
  isDropdownCentered,
  zIndex = "auto",
  hasClickOutsideListener,
  positioning = isDropdownCentered ? "center" : "left",
  isOpen,
  triggerKeys,
  ...props
}) {
  const IS_CONTROLLED = !(typeof isOpen === "undefined" || isOpen === null);
  let modeCopy = mode;

  if (mode !== "hover" && mode !== "click") {
    console.error(
      "Use one of ['hover', 'click'] for mode prop. Defaulting to hover.",
    );
    modeCopy = "hover";
  }

  if (isDropdownCentered) {
    console.warn(
      "`isDropdownCentered` is deprecated. Use `positioning` set to `center` instead.",
    );
  }

  if (isDropdownCentered) {
    console.warn(
      "`triggerKeys` is deprecated. All dropdowns are triggered with either Space or Enter keys when focused",
    );
  }

  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [shouldRenderContent, setShouldRenderContent] = useState(false);
  const [isDropdownShown, setIsDropdownShown] = useState(false);
  const refContainer = useRef();
  const refDropdown = useRef();

  const calculatePositionAndSetState = useCallback(() => {
    if (isDropdownShown) {
      const position = calculatePosition(
        refContainer,
        refDropdown,
        positioning,
      );
      setPosition(position);
    }
  }, [isDropdownShown, positioning]);

  useEffect(() => {
    window.addEventListener("scroll", calculatePositionAndSetState);
    window.addEventListener("resize", calculatePositionAndSetState);

    return () => {
      window.removeEventListener("scroll", calculatePositionAndSetState);
      window.removeEventListener("resize", calculatePositionAndSetState);
    };
  }, [calculatePositionAndSetState]);

  useEffect(() => {
    if (IS_CONTROLLED) {
      if (isOpen) {
        setShouldRenderContent(true);
      } else {
        setShouldRenderContent(false);
      }
    }
  }, [IS_CONTROLLED, isOpen]);

  useEffect(() => {
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

  useEffect(() => {
    function outsideClickListener(event) {
      if (
        refContainer.current &&
        !refContainer.current.contains(event.target)
      ) {
        setShouldRenderContent(false);
      }
    }

    if (hasClickOutsideListener && !IS_CONTROLLED) {
      window.addEventListener("click", outsideClickListener);
    }
    return () => window.removeEventListener("click", outsideClickListener);
  }, [IS_CONTROLLED, hasClickOutsideListener, positioning]);

  function onKeyDown(event) {
    if (mode === "hover") {
      if ([" ", "Enter"].includes(event.key)) {
        setShouldRenderContent(curr => !curr);
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

  function onClick(event) {
    if (IS_CONTROLLED) {
      return;
    }
    if (modeCopy === "click") {
      if (!refDropdown.current.contains(event.target)) {
        setShouldRenderContent(curr => !curr);
      }
    }
    return;
  }

  return (
    <div
      className={wrapperClass}
      tabIndex={IS_CONTROLLED ? null : 0}
      role={IS_CONTROLLED ? null : "button"}
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
        className={dropdownWrapperClass}
        id={dropdownWrapperId}
        ref={refDropdown}
        style={{
          visibility: isDropdownShown ? "visible" : "hidden",
          position: "fixed",
          top: position.top,
          left: position.left,
          zIndex,
          display: "flex",
        }}
      >
        {shouldRenderContent ? dropdown : null}
      </div>
    </div>
  );
}

Dropdown.propTypes = {
  mode: PropTypes.string,
  children: PropTypes.node,
  dropdown: PropTypes.node,
  wrapperClass: PropTypes.string,
  wrapperId: PropTypes.string,
  dropdownWrapperClass: PropTypes.string,
  dropdownWrapperId: PropTypes.string,
  isDropdownCentered: PropTypes.bool,
  zIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hasClickOutsideListener: PropTypes.bool,
  positioning: PropTypes.oneOf(["left", "center", "right"]),
  isOpen: PropTypes.bool,
};

Dropdown.defaultProps = {
  mode: "hover",
  children: null,
  dropdown: null,
  wrapperClass: null,
  wrapperId: null,
  dropdownWrapperClass: null,
  dropdownWrapperId: null,
  isDropdownCentered: null,
  zIndex: "auto",
  hasClickOutsideListener: false,
  positioning: "left",
  isOpen: null,
};

export default Dropdown;

import React, { useState, useRef, useEffect } from "react";

let IS_CONTROLLED = false;

const clamp = ({ left, top, width /*,height*/ }) => {
  if (left < 0) {
    left = 0;
  } else if (left + width > document.documentElement.clientWidth) {
    left = document.documentElement.clientWidth - width;
  }

  // TODO clamp top based on a prop

  return { left, top };
};

export default function({
  mode = "hover",
  children,
  dropdown,
  wrapperClass,
  wrapperId,
  dropdownWrapperClass,
  dropdownWrapperId,
  isDropdownCentered,
  zIndex,
  hasClickOutsideListener,
  positioning = isDropdownCentered ? "center" : "left",
  isOpen,
}) {
  IS_CONTROLLED = !(isOpen === 'undefined' || isOpen === null);

  if (mode !== "hover" && mode !== "click") {
    console.error(
      "Use one of ['hover', 'click'] for mode prop. Defaulting to hover.",
    );
    mode = "hover";
  }

  if (isDropdownCentered) {
    console.warn(
      "`isDropdownCentered` is deprecated. Use `positioning` set to `center` instead.",
    );
  }

  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [isDropdownShown, _setIsDropdownShown] = useState(IS_CONTROLLED ? isOpen : false);
  const refContainer = useRef();
  const refDropdown = useRef();

  function setIsDropdownShown(val) {
    if (!IS_CONTROLLED) {
      _setIsDropdownShown(val);
    }
  }

  function outsideClickListener(event) {
    if (refContainer.current && !refContainer.current.contains(event.target)) {
      setIsDropdownShown(false);
    }
  }

  useEffect(() => {
    calculatePosition();

    if (hasClickOutsideListener) {
      window.addEventListener("click", outsideClickListener);
    }
    return () => window.removeEventListener("click", outsideClickListener);
  }, []);

    useEffect(() => {
      if(IS_CONTROLLED) {
      _setIsDropdownShown(isOpen);
      }
    }, [isOpen]);

  function calculatePosition() {
    let { left, top, width, height } =
      refContainer && refContainer.current.getBoundingClientRect();

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
        throw new Error("Unknown positioning " + positioning);
    }

    const clamped = clamp({
      left,
      top,
      width: refDropdown && refDropdown.current.getBoundingClientRect().width,
      height: refDropdown && refDropdown.current.getBoundingClientRect().height,
    });

    setPosition({ left: clamped.left, top: clamped.top + height });
  }

  function calculatePositionThenShow() {
    calculatePosition();
    setIsDropdownShown(true);
  }

  function toggleDropdown(event) {
    if (!refDropdown.current.contains(event.target)) {
      if (isDropdownShown) {
        setIsDropdownShown(false);
      } else {
        calculatePositionThenShow();
      }
    }
  }

  useEffect(() => {
    if (isDropdownShown) {
      window.addEventListener("scroll", calculatePosition);
      window.addEventListener("resize", calculatePosition);
    }
    return () => {
      window.removeEventListener("scroll", calculatePosition);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isDropdownShown]);

  return (
    <div
      className={wrapperClass}
      id={wrapperId}
      ref={refContainer}
      onMouseEnter={mode === "hover" ? calculatePositionThenShow : () => {}}
      onMouseLeave={() =>
        mode === "hover" ? setIsDropdownShown(false) : () => {}
      }
      onClick={mode === "click" ? toggleDropdown : () => {}}
      style={{
        height: "min-content",
        width: "min-content",
      }}
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
        {dropdown}
      </div>
    </div>
  );
}

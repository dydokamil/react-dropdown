import React, { useState, useRef, useEffect } from "react";

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
  isDropdownCentered
}) {
  if (mode !== "hover" && mode !== "click") {
    console.error(
      "Use one of ['hover', 'click'] for mode prop. Defaulting to hover."
    );
    mode = "hover";
  }

  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [isDropdownShown, setIsDropdownShown] = useState(false);

  const refContainer = useRef();
  const refDropdown = useRef();

  function calculatePosition() {
    let { left, top, width, height } =
      refContainer && refContainer.current.getBoundingClientRect();

    if (isDropdownCentered) {
      left += width / 2;
      left -= refDropdown.current.getBoundingClientRect().width / 2;
    }

    const clamped = clamp({
      left,
      top,
      width: refDropdown && refDropdown.current.getBoundingClientRect().width,
      height: refDropdown && refDropdown.current.getBoundingClientRect().height
    });

    setPosition({ left: clamped.left, top: clamped.top + height });
  }

  function calculatePositionThenShow() {
    calculatePosition();
    setIsDropdownShown(true);
  }

  function toggleDropdown() {
    if (isDropdownShown) {
      setIsDropdownShown(false);
    } else {
      calculatePositionThenShow();
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
      style={{ height: "fit-content", width: "fit-content" }}
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
          left: position.left
        }}
      >
        {dropdown}
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

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

function Dropdown({
  mode = 'hover',
  children,
  dropdown,
  wrapperClass,
  wrapperId,
  dropdownWrapperClass,
  dropdownWrapperId,
  isDropdownCentered,
  zIndex = 'auto',
  hasClickOutsideListener,
  positioning = isDropdownCentered ? 'center' : 'left',
  isOpen,
  triggerKeys = ['Enter'],
}) {
  const IS_CONTROLLED = !(typeof isOpen === 'undefined' || isOpen === null);
  let modeCopy = mode;

  if (mode !== 'hover' && mode !== 'click') {
    console.error(
      "Use one of ['hover', 'click'] for mode prop. Defaulting to hover.",
    );
    modeCopy = 'hover';
  }

  if (isDropdownCentered) {
    console.warn(
      '`isDropdownCentered` is deprecated. Use `positioning` set to `center` instead.',
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

  function calculatePosition() {
    const dropdownPosition = refContainer && refContainer.current.getBoundingClientRect();
    let { left } = dropdownPosition;
    const { top, width, height } = dropdownPosition;

    switch (positioning) {
      case 'center':
        left += width / 2;
        left -= refDropdown.current.getBoundingClientRect().width / 2;
        break;
      case 'left':
        break;
      case 'right':
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

    setPosition({ left: clamped.left, top: clamped.top + height });
  }

  useEffect(() => {
    calculatePosition();

    if (hasClickOutsideListener) {
      window.addEventListener('click', outsideClickListener);
    }
    return () => window.removeEventListener('click', outsideClickListener);
  }, []);

  useEffect(() => {
    if(isOpen) {
      calculatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (IS_CONTROLLED) {
      _setIsDropdownShown(isOpen);
    }
  }, [isOpen]);

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

  function onKeyDown(event) {
    if (IS_CONTROLLED) {
      return null;
    }
    if (triggerKeys.includes(event.key)) {
      toggleDropdown(event);
    }
    return null;
  }

  function onMouseEnter() {
    if (IS_CONTROLLED) {
      return null;
    }
    if (modeCopy === 'hover') {
      calculatePositionThenShow();
    }
    return null;
  }

  function onMouseLeave() {
    if (IS_CONTROLLED) {
      return null;
    }
    if (modeCopy === 'hover') {
      setIsDropdownShown(false);
    }
    return null;
  }

  function onClick(event) {
    if (IS_CONTROLLED) {
      return null;
    }
    if (modeCopy === 'click') {
      toggleDropdown(event);
    }
    return null;
  }

  useEffect(() => {
    if (isDropdownShown) {
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    }
    return () => {
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isDropdownShown]);

  return (
    <div
      className={wrapperClass}
      tabIndex={IS_CONTROLLED ? null : 0}
      role={IS_CONTROLLED ? null : 'button'}
      onKeyDown={onKeyDown}
      id={wrapperId}
      ref={refContainer}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        height: 'min-content',
        width: 'min-content',
      }}
    >
      {children}
      <div
        className={dropdownWrapperClass}
        id={dropdownWrapperId}
        ref={refDropdown}
        style={{
          visibility: isDropdownShown ? 'visible' : 'hidden',
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex,
          display: 'flex',
        }}
      >
        {dropdown}
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
  positioning: PropTypes.oneOf(['left', 'center', 'right']),
  isOpen: PropTypes.bool,
  triggerKeys: PropTypes.arrayOf(PropTypes.string),
};

Dropdown.defaultProps = {
  mode: 'hover',
  children: null,
  dropdown: null,
  wrapperClass: null,
  wrapperId: null,
  dropdownWrapperClass: null,
  dropdownWrapperId: null,
  isDropdownCentered: null,
  zIndex: 'auto',
  hasClickOutsideListener: false,
  positioning: 'left',
  isOpen: null,
  triggerKeys: ['Enter'],
};

export default Dropdown;

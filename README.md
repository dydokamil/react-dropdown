# Links

demo: https://react-dropdown-overflow.herokuapp.com/

example: https://github.com/dydokamil/react-dropdown-example

# Installation

    yarn add react-dropdown-overflow

or

    npm install react-dropdown-overflow

## Importing

    import Dropdown from 'react-dropdown-overflow'

## Usage

    import Dropdown from 'react-dropdown-overflow'

    class MyComponent extends React.Component {
      render() {
        <Dropdown dropdown={
          <div className='dropdown-list'>
            <ul>
             <li>item1</li>
             <li>item2</li>
             <li>item3</li>
           </ul>
          </div>
        }>
          <button>Toggler</button>
        </Dropdown>
      }
    }

## Props

##### `mode`

Sets the behavior of the toggling element. Defaults to `hover`. Valid values are:

`hover | click` :: Whether the dropdown is triggered with a mouse click or on hover event.

---

##### `children`

A React component responsible for the toggling of the dropdown.

---

##### `dropdown`

A React component to be displayed as a dropdown.

---

##### `isDropdownCentered`

A boolean prop responsible for the centering of the menu. Valid values are:

`true | false` :: Whether the dropdown menu is centered.

---

##### `wrapperClass`

Class name of the newly created element wrapping the `children` prop.

---

##### `wrapperId`

`id` of the newly created element wrapping the `children` prop.

---

##### `dropdownWrapperClass`

Class name of the newly created element wrapping the dropdown.

---

##### `dropdownWrapperId`

`id` of the newly created element wrapping the dropdown.
